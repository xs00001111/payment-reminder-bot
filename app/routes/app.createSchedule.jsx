// app/routes/app.createSchedule.jsx

import { PrismaClient } from '@prisma/client';
import {authenticate} from "~/shopify.server";
import {json} from "@remix-run/node"; // Import your Prisma client or whatever you named it.

export async function action({ request })  {
    const params = new URLSearchParams(await request.text());
    const days = parseInt(params.get('days'));
    const { session } = await authenticate.admin(request);

    // Replace with actual method or variable to get the current shop name in your context.
    const shopName = session.shop.replace(".myshopify.com", "");
    const prisma = new PrismaClient();

    try {
        const schedule = await prisma.schedule.upsert({
            where: {
                recurringDays_objectType_shop: {
                    recurringDays: days,
                    objectType: "DRAFT_ORDER",
                    shop: shopName
                }
            },
            update: {},
            create: {
                objectType: "DRAFT_ORDER",
                recurringDays: days,
                shop: shopName
            }
        });

        return { status: 200, data: schedule };

    } catch (error) {
        return { status: 500, data: { error: "Error upserting schedule." } };
    }
};

export default function CreateSchedulePage({ data }) {
    if (data.error) {
        return <div>Error: {data.error}</div>;
    }

    return (
        <div>
            <h2>Schedule Created</h2>
            <p>Object Type: {data.objectType}</p>
            <p>Recurring Days: {data.recurringDays}</p>
            <p>Shop: {data.shop}</p>
        </div>
    );
}
