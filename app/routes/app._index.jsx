import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useState } from 'react';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  Box,
  Link,
  Modal,
  Frame,
  TextField, ButtonGroup,
} from "@shopify/polaris";


import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

const handleViewSchedule = () => {
  // Your logic for "View Schedule"
};

const handleViewAutoSentDetails = () => {
  // Your logic for "View Auto Sent Details"
};
function DashboardDescription() {
  return (
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Box>
                <p>
                  Navigating the world of e-commerce just became a breeze with our Shopify Assistant Bot!
                </p>

                <Text variant="headingLg" as="p">1. Efficient Account Receivables Collection:</Text>
                <p>
                  Struggling with pending payments? Our bot will actively help you gather account receivables from customers. Plus, it gently nudges them to finalize their incomplete orders, ensuring you never miss out on a sale.
                </p>
                <Text variant="headingLg" as="p">2. Personalized Invoice & Reminder Management:</Text>
                <p>
                  Dive into the details of individual orders and draft orders right from your dashboard. With just a click, you can send invoices or dispatch timely reminders to your customers.
                </p>

                <Text variant="headingLg" as="p">3. Automated Reminder Scheduling:</Text>
                <p>
                  Why wait and watch? Automate the process! You can set the bot to send out reminders based on your preferences, such as 3 days after an unpaid order. This means less manual tracking and more peace of mind for you.
                </p>

                <p>
                  Empower your Shopify store with the intelligence and efficiency of our bot, and witness a smoother, more profitable journey ahead!
                </p>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
  );
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );

  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
}


export default function Index() {
  const nav = useNavigation();
  const { shop } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [days, setDays] = useState('');  // State for the user input

  // Open the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the "days" value as needed, for example:
    console.log(`Send invoice and payment link after ${days} days of pending.`);
    setIsModalOpen(false);
  };

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  // const draftOrderId = actionData.draftOrders?.id.replace(    "gid://shopify/DraftOrder/",
  //   "")

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);

  return (
    <Page title="Introducing Your Shopify Assistant Bot 🤖">
      <VerticalStack gap="5">
      <DashboardDescription/>
        <Card sectioned>
          <VerticalStack gap="2">
            <Text variant="bodyMd" as="p">
              Review payment status of your orders.
              Send and resend invoices to your customers for your orders.
            </Text>
            <Link url="/app/orders" external={false}>
              <Button>Go to Orders</Button>
            </Link>
          </VerticalStack>
        </Card>

        <Card sectioned>
          <VerticalStack gap="2">
            <Text variant="bodyMd" as="p">
              Send out invoices with payment link to your customers.
              Update invoices and resend them to your customers
            </Text>
            <Link url="/app/draftOrders" external={false}>
              <Button>Go to Draft Orders</Button>
            </Link>
          </VerticalStack>
        </Card>
        {/* New Schedule Payment Reminder Card */}
        <Card sectioned title="Schedule Payment Reminder">
          <Box>
            <p>
              Ensure your customers never forget their outstanding orders. Set up scheduled reminders to notify them about payments due.
            </p>
            <ButtonGroup>
              <div>
            <Button onClick={handleOpenModal}>Schedule Reminder</Button>
                {isModalOpen && (
                    <Frame>
                    <Modal
                        open={isModalOpen}
                        onClose={handleCloseModal}
                        title="Send invoice + payment link for your open draft orders"
                        primaryAction={{
                          content: 'Submit',
                          onAction: handleSubmit,
                        }}
                        secondaryActions={[
                          {
                            content: 'Close',
                            onAction: handleCloseModal,
                          },
                        ]}
                    >
                      <Modal.Section>
                        <VerticalStack gap = "3">
                          <Text variant="bodyMd" as="p">Send invoice and payment link after</Text>
                          <TextField
                              type="number"
                              value={days}
                              onChange={(value) => setDays(value)}
                              label="Number of days"
                              autoComplete="off"
                              connectedRight={<span>days of pending</span>}
                          />
                        </VerticalStack>
                      </Modal.Section>
                    </Modal>
                    </Frame>
                )}
              </div>
              <Button onClick={handleViewSchedule}>View Schedule</Button>
              <Button onClick={handleViewAutoSentDetails}>View Auto Sent Details</Button>
            </ButtonGroup>
          </Box>
        </Card>
      </VerticalStack>
    </Page>
  );
}
