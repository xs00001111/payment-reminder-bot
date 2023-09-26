import { PrismaClient } from '@prisma/client'; // Adjust the path based on your setup

export let action = async ({ request }) => {
    if (request.method !== 'POST') {
        return new Response("Invalid method", { status: 405 });
    }
    const prisma = new PrismaClient();
    const requestBody = await request.text();

    // TODO: Verify webhook integrity if required

    const payload = JSON.parse(requestBody);

    // Extract the draft order ID (assuming the payload structure here)
    const draftOrderId = payload.id;

    // Save it in the database
    await prisma.DraftOrder.create({
        data: {
            orderId: draftOrderId.toString()
        }
    });

    return new Response("Webhook received and processed", { status: 200 });
};
