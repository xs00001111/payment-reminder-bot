import { PrismaClient } from '@prisma/client';
import {LoaderFunction} from "@remix-run/node"; // Adjust the path based on your setup

export let loader: LoaderFunction = ({ request }) => {
    if (request.method === 'GET') {
        return {
            status: 405, // Method Not Allowed
            data: { message: 'GET method not allowed.' }
        };
    }
};

export let action: LoaderFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return new Response("Invalid method", { status: 405 });
    }

    const requestBody = await request.text();

    // TODO: Verify webhook integrity if required

    const payload = JSON.parse(requestBody);

    // Extract the draft order ID (assuming the payload structure here)
    const draftOrderId = payload.id;

    const prisma = new PrismaClient();

    // Save it in the database
    await prisma.draftOrder.create({
        data: {
            orderId: draftOrderId.toString()
        }
    });

    return new Response("Webhook received and processed", { status: 200 });
};
