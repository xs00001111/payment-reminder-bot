// app/routes/app.viewSchedules.jsx

import { PrismaClient } from '@prisma/client';
import {useActionData, useNavigation, useSubmit} from "@remix-run/react";
import {authenticate} from "~/shopify.server";
import {useEffect} from "react"; // Import your Prisma client or whatever you named it.

export async function action({ request })  {
    const {admin} = await authenticate.admin(request);
    const prisma = new PrismaClient();
    try {
        const schedules = await prisma.schedule.findMany();
        return { status: 200, data: schedules };
    } catch (error) {
        return { status: 500, data: { error: "Error fetching schedules." } };
    }
};

export default function ViewSchedulesPage({ data }) {
    const nav = useNavigation();
    const actionData = useActionData();
    const submit = useSubmit();
    const isLoading = nav.formMethod === "POST";

    // Automatically call the sendInvoice function when the component mounts
    useEffect(() => {
        submit({}, { replace: true, method: "POST" });
    }, [submit]);

    // if (data.error) {
    //     return <div>Error: {data.error}</div>;
    // }

    return (
        <div>
            {actionData?.error && <p>Error: {actionData.error}</p>}
            <h2>All Schedules</h2>
            <ul>
                {actionData?.data.map((schedule, idx) => (
                    <li key={idx}>
                        <p>Object Type: {schedule.objectType}</p>
                        <p>Recurring Days: {schedule.recurringDays}</p>
                        <p>Shop: {schedule.shop}</p>
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
}
