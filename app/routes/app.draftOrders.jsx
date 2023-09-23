import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import {
  Page,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
} from "@shopify/polaris";
import { PrismaClient } from '@prisma/client';
import {useActionData, useNavigate, useNavigation, useSubmit} from "@remix-run/react";

export async function fetchInvoiceStatusesForDraftOrders(prisma, draftOrderIds) {
  try {
    const invoiceStatuses = await prisma.invoiceStatus.findMany({
      where: {
        invoicableId: {
          in: draftOrderIds.map(id => BigInt(id))
        },
        invoicableType: 'draftOrder'
      }
    });
    return invoiceStatuses;
  } catch (error) {
    console.error("Error fetching invoice statuses:", error);
    return [];
  }
}
export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      {
        draftOrders(first: 10) {
          edges {
            node {
              id
              name
              email
              status
              createdAt
              updatedAt
              invoiceUrl
              order {
                id
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }`
  );

  const responseJson = await response.json();

  const prisma = new PrismaClient();
  //Get data here and put them to the output Json and the DraftOrder card.

  if (responseJson.errors) {
    return json({ error: "Failed to fetch draft orders" });
  }

  const draftOrdersIds = responseJson.data.draftOrders.edges.map(edge => edge.node.id.split('/').pop());

  const statuses = await fetchInvoiceStatusesForDraftOrders(prisma, draftOrdersIds);


  return json({
    draftOrders: responseJson.data.draftOrders.edges.map(edge => edge.node),
    statuses: JSON.stringify(statuses, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ),
  });
}

async function fetchInvoiceStatusForDraftOrder(prisma, draftOrderId) {
  try {
    // Fetch the invoice status for the given draft order ID
    const invoiceStatus = await prisma.invoiceStatus.findFirst({
      where: {
        invoicableId: BigInt(draftOrderId), // Convert to BigInt as Prisma expects BIGINT type
        invoicableType: 'draftOrder'       // Ensures we get the status for draft orders only
      }
    });

    return invoiceStatus;
  } catch (error) {
    console.error("Error fetching invoice status:", error);
    return null;
  }
}

const DraftOrderCard = ({ draftOrder, status }) => {
  const navigate = useNavigate();

  const handleSendInvoice = (draftOrderId) => {
    // Extract the integer part of the draftOrder ID for the route parameter
    const idIntPart = draftOrderId.split('/').pop();
    navigate(`/app/sendDraftOrderInvoice/${idIntPart}`);
  };

  const isCompleted = draftOrder.order && draftOrder.order.id;  // Check if the draftOrder has a related order

  return (
      <Card
          sectioned
          title={`Draft Order: ${draftOrder.name}`}
          actions={[
            {content: 'View Invoice', onAction: () => window.open(draftOrder.invoiceUrl, "_blank")}
          ]}
      >
        {/*{invoiceStatus && <p style={{color: 'red'}}>Invoice has been sent at {new Date(invoiceStatus.createdAt).toLocaleString()}</p>}*/}
        <p><Text as="span" fontWeight="semibold">ID:</Text> {draftOrder.id}</p>
        <p><Text as="span" fontWeight="semibold">Name:</Text> {draftOrder.name}</p>
        <p><Text as="span" fontWeight="semibold">Status:</Text> {draftOrder.status}</p>
        {draftOrder.email && <p><Text as="span" fontWeight="semibold">Email:</Text> {draftOrder.email}</p>}
        <p><Text as="span" fontWeight="semibold">Created At:</Text> {new Date(draftOrder.createdAt).toLocaleString()}</p>
        <p><Text as="span" fontWeight="semibold">Updated At:</Text> {new Date(draftOrder.updatedAt).toLocaleString()}</p>
        <p>
          <Text as="span" fontWeight="semibold">Total:</Text>
          {draftOrder.totalPriceSet.shopMoney.amount} {draftOrder.totalPriceSet.shopMoney.currencyCode}
        </p>
        {status && (
            <p style={{ color: 'red' }}>
              Invoice has been sent at {new Date(status.createdAt).toLocaleString()}
            </p>
        )}
        {isCompleted && <p style={{color: 'green'}}>Completed</p>}
        <Button onClick={() => handleSendInvoice(draftOrder.id)}>
          {status ? "Resend Invoice" : "Send Invoice"}
        </Button>
      </Card>
  );
};

export default function DraftOrderPage() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading = nav.formMethod === "POST";

  const getDraftOrders = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <ui-title-bar title="Manage Draft Orders">
      </ui-title-bar>
      <VerticalStack gap="5">
        <Card>
          <VerticalStack gap="2">
            <Text as="h2" variant="headingMd">
              Draft Orders Management 📝
            </Text>
            <Text variant="bodyMd" as="p">
              Below you can view the recent draft orders or fetch the latest ones.
            </Text>
          </VerticalStack>
          <HorizontalStack gap="3" align="end">
            <Button loading={isLoading} primary onClick={getDraftOrders}>
              Fetch Draft Orders
            </Button>
          </HorizontalStack>
          {actionData?.draftOrders && (
              <Box
                  padding="4"
                  background="bg-subdued"
                  borderColor="border"
                  borderWidth="1"
                  borderRadius="2"
                  overflowX="scroll"
              >
    <pre style={{ margin: 10 }}>
      <VerticalStack gap="3">
        {
          actionData?.draftOrders?.map(draftOrder => {
            const parsedStatuses = JSON.parse(actionData?.statuses);
            // Find the corresponding status for the current draftOrder
            const correspondingStatus = parsedStatuses.find(status => BigInt(status.invoicableId) === BigInt(draftOrder.id.split('/').pop()));

            return (
                <DraftOrderCard
                    key={draftOrder.id}
                    draftOrder={draftOrder}
                    status={correspondingStatus} // Pass the found status
                />
            );
          })
        }
      </VerticalStack>
    </pre>
              </Box>
          )}


          {actionData?.error && (
            <Box
              padding="4"
              background="bg-negative"
              borderColor="border"
              borderWidth="1"
              borderRadius="2"
            >
              <Text color="text-error">{actionData.error}</Text>
            </Box>
          )}
        </Card>
      </VerticalStack>
    </Page>
  );
}
