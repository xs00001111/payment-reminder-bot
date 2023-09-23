import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import {
    Page,
    Text,
    Card,
} from "@shopify/polaris";
import {useActionData, useNavigation, useSubmit} from "@remix-run/react";
import { PrismaClient } from '@prisma/client';
import { useEffect } from "react";


export async function action({ request, params }) {
    const {admin} = await authenticate.admin(request);
    const id = `gid://shopify/Order/${params.orderId}`;
    const prisma = new PrismaClient();
    const customMessage = "Thank you for your order"
    const response = await admin.graphql(
        `mutation orderInvoiceSend($email: EmailInput) {
      orderInvoiceSend(id: "${id}", email: $email) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        {
            email: {
                to: "eileenshen80@gmail.com",
                from: "Sales Modyl <salesmodel@example.com>",
                subject: "Invoice #1001",
                customMessage: customMessage
            }
        }
    );

    const responseJson = await response.json();

    if (responseJson.errors) {
        return json({ error: "Failed to send Invoices" });
    }

    // Check for user errors
    if (responseJson.userErrors && responseJson.userErrors.length > 0) {
        return json({ status: "Failure", error: responseJson.userErrors[0].message });
    }

    // If there's no error, create or update an invoice status object
    const invoiceStatus = await prisma.invoiceStatus.upsert({
        where: {
            invoicableType_invoicableId: {
                invoicableType: "ORDER",
                invoicableId: BigInt(params.orderId)  // Ensure this is a BigInt
            }
        },
        create: {
            invoicableType: "ORDER",
            invoicableId: BigInt(params.orderId),
            paid: false,
            version: 1,
            customMessage: customMessage
        },
        update: {
            version: {
                increment: 1
            }
        }
    });

    return json({
        status: "Success",
        invoiceStatus: {
            invoiceType: "ORDER",
            invoicableId: params.orderId.toString(),
            paid: false,
            version: 1,
            customMessage: customMessage
        },
    });
}

export default function SendInvoiceOrderId() {
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
                        <p><Text as="span" fontWeight="semibold">Order ID:</Text> {actionData.invoiceStatus.invoicableId}</p>
                        <p><Text as="span" fontWeight="semibold">Paid:</Text> {actionData.invoiceStatus.paid ? "Yes" : "No"}</p>
                        <p><Text as="span" fontWeight="semibold">Invoice Version for this Order:</Text> {actionData.invoiceStatus.version}</p>
                        <p><Text as="span" fontWeight="semibold">Notes with Invoice:</Text> {actionData.invoiceStatus.customMessage}</p>
                    </Card>
                )}
            </div>
        </Page>
    )
}
