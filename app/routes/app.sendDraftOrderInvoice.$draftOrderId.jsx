import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import {
    Page,
    Text,
    Card,
} from "@shopify/polaris";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { PrismaClient } from '@prisma/client';
import {useEffect} from "react";



export async function action({ request, params }) {
    const { admin } = await authenticate.admin(request);

    const draftOrderId = request.url.split('/').pop(); // Assuming the draftOrderId is the last segment of the URL
    const constructedId = `gid://shopify/DraftOrder/${draftOrderId}`;
    const prisma = new PrismaClient();

    const response = await admin.graphql(
        `mutation draftOrderInvoiceSend {
          draftOrderInvoiceSend(id: "${constructedId}") {
            draftOrder {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
        { id: constructedId }
    );


    const responseJson = await response.json();

    await prisma.invoiceStatus.upsert({
        where: {
            // Composite unique identifier
            invoicableType_invoicableId: {
                invoicableType: "draftOrder",
                invoicableId: BigInt(params.draftOrderId)
            }
        },
        create: {
            invoicableType: "draftOrder",
            invoicableId: BigInt(params.draftOrderId),
            paid: false,
            version: 1,
            customMessage: "Test draft order"
        },
        update: {
            version: {
                increment: 1
            }
        }
    });

    if (responseJson.errors) {
        return json({ error: "Failed to send Invoices" });
    }

    // Check for user errors
    if (responseJson.userErrors && responseJson.userErrors.length > 0) {
        return json({ status: "Failure", error: responseJson.userErrors[0].message });
    }

    return json({
        status: "Success",
        invoiceStatus: {
            invoiceType: "draftOrder",
            invoicableId: params.draftOrderId.toString(),
            paid: false,
            version: 1,
            customMessage: "Test draft order"
        },
    });

}

export default function SendDraftOrderInvoice() {
    const nav = useNavigation();
    const actionData = useActionData();
    const submit = useSubmit();
    const isLoading = nav.formMethod === "POST";

    // Automatically call the sendInvoice function when the component mounts
    useEffect(() => {
        submit({}, { replace: true, method: "POST" });
    }, [submit]);

    return (
        <Page>
            <ui-title-bar title="Sent Invoice">
            </ui-title-bar>
            <div>
                {isLoading && <p>Sending Invoice...</p>}
                {actionData?.error && <p>Error: {actionData.error}</p>}
                {actionData?.status === "Failure" && <p>Failed to send invoice, please try again.</p>}
                {actionData?.status === "Success" && actionData?.invoiceStatus && (
                    <Card title="Invoice Status">
                        <p><Text as="span" fontWeight="semibold">Draft Order ID:</Text> {actionData.invoiceStatus.invoicableId}</p>
                        <p><Text as="span" fontWeight="semibold">Paid:</Text> {actionData.invoiceStatus.paid ? "Yes" : "No"}</p>
                        <p><Text as="span" fontWeight="semibold">Invoice Version for this Order:</Text> {actionData.invoiceStatus.version}</p>
                        <p><Text as="span" fontWeight="semibold">Notes with Invoice:</Text> {actionData.invoiceStatus.customMessage}</p>
                    </Card>
                )}
            </div>
        </Page>
    )
}
