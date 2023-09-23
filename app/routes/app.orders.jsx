import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Text,
  VerticalStack,
  HorizontalStack,
  Card,
  Button,
  ButtonGroup,
  Box,
  Link,
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react"
import { authenticate } from "../shopify.server";
import { PrismaClient } from '@prisma/client';

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

const fetchInvoiceStatusesForOrders = async (prisma, orderIds) => {
    if (!orderIds || orderIds.length === 0) {
        return [];
    }

    try {
        // Fetch invoice statuses for the provided order IDs
        const invoiceStatuses = await prisma.invoiceStatus.findMany({
            where: {
                invoicableType: "ORDER",
                invoicableId: {
                    in: orderIds.map(id => BigInt(id)) // Ensure the IDs are BigInts
                }
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

  const prisma = new PrismaClient();

  const response = await admin.graphql(`
  #graphql
  {
    orders(first: 10) {
      edges {
        node {
          id
          name
          email
          createdAt
          unpaid
          updatedAt
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          transactions {
            status
            createdAt
            processedAt
            fees {
              amount {
                amount
                currencyCode
              }
              taxAmount {
                amount
                currencyCode
              }
            }
            accountNumber
            amountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`);

  const responseJson = await response.json();


  if (responseJson.errors) {

    return json({ errors: responseJson.errors });
  }

  const orderIds = responseJson.data.orders.edges.map(edge => edge.node.id.split('/').pop());

  const invoiceStatuses = await fetchInvoiceStatusesForOrders(prisma, orderIds);

  return json({ orders: responseJson.data.orders.edges,
      statuses:  JSON.stringify(invoiceStatuses, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
      ),});
}


const TransactionDetails = ({ transaction }) => (
    <HorizontalStack gap="3">
        <p><Text as="span" fontWeight="semibold">Status:</Text> {transaction.status}</p>
        <p><Text as="span" fontWeight="semibold">Created At:</Text> {transaction.createdAt}</p>
        <p><Text as="span" fontWeight="semibold">Processed At:</Text> {transaction.processedAt}</p>
        {/* Extract other fields from the transaction as needed */}
    </HorizontalStack>
);

// Handle sending payment reminder
const handleSendPaymentReminder = (orderId) => {
    // Logic to send payment reminder for the specific order
    console.log(`Sending payment reminder for order ${orderId}`);
};

function extractOrderId(orderIdString) {
    // Using RegExp to match the last set of digits in the string
    const match = orderIdString.match(/(\d+)$/);

    // If a match is found, return the matched integer. Otherwise, return null.
    return match ? parseInt(match[0], 10) : null;
}

const OrderCard = ({ order, correspondingStatus }) => {
    let navigate = useNavigate()

    const handleSendInvoice = async (order) => {
        // Redirect to the new route which will handle the sending of the invoice
        const orderId = extractOrderId(order.id)
        navigate(`/app/sendInvoice/${orderId}`);
    };

    return (
        <Card sectioned title={`Order: ${order.name}`}>
            <p><Text as="span" fontWeight="semibold">ID:</Text> {order.id}</p>
            <p><Text as="span" fontWeight="semibold">Name:</Text> {order.name}</p>
            <p><Text as="span" fontWeight="semibold">Email:</Text> {order.email}</p>
            <p><Text as="span" fontWeight="semibold">Created At:</Text> {order.createdAt}</p>
            <p><Text as="span" fontWeight="semibold">Unpaid:</Text> {order.unpaid ? 'Yes' : 'No'}</p>
            <p><Text as="span" fontWeight="semibold">Updated At:</Text> {order.updatedAt}</p>
            <p><Text as="span" fontWeight="semibold">Price:</Text> {order.currentTotalPriceSet?.shopMoney?.amount} {order.currentTotalPriceSet.shopMoney?.currencyCode}</p>
            <div>
                <Text as="span" fontWeight="semibold">Transactions:</Text>
                {order.transactions.map((transaction, index) => (
                    <TransactionDetails key={index} transaction={transaction} />
                ))}
            </div>

            {/* Display correspondingStatus if it exists */}
            {correspondingStatus && (
                <p style={{ color: 'red' }}>Invoice has been sent at {new Date(correspondingStatus.createdAt).toLocaleString()}</p>
            )}

            {/* Buttons */}
            <Button onClick={() => handleSendInvoice(order)}>
                {correspondingStatus ? 'Resend Invoice' : 'Send Invoice'}
            </Button>
        </Card>
    );
}


export default function Orders() {
  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const fetchOrders = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <ui-title-bar title="Manage Order Invoicing">
      </ui-title-bar>
      <VerticalStack gap="5">
        <Card>
          <VerticalStack gap="2">
            <Text as="h2" variant="headingMd">
              Orders for {shop}
            </Text>
            <Button loading={isLoading} primary onClick={fetchOrders}>
              Get Orders
            </Button>
            {actionData?.orders && (
              <Box
                padding="4"
                background="bg-subdued"
                borderColor="border"
                borderWidth="1"
                borderRadius="2"
                overflowX="scroll"
              >
                {actionData?.orders?.map(order => {
                    const parsedStatuses = JSON.parse(actionData?.statuses);
                    // Find the corresponding status for the current draftOrder
                    const correspondingStatus = parsedStatuses.find(status => BigInt(status.invoicableId) === BigInt(order.node.id.split('/').pop()));
                    return (<OrderCard order={order.node} correspondingStatus={correspondingStatus} />);
                })}
              </Box>
            )}
          </VerticalStack>
        </Card>
      </VerticalStack>
    </Page>
  );
}
