const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
let fetch;

import('node-fetch').then(module => {
    fetch = module.default;
});

const prisma = new PrismaClient();

// const { sendInvoices } = require('../path_to_your_invoice_logic');

// This will run every day at 1am

//TODO:
// 1. get pending draft order
// 2. get schedule for this store
// 3. click send invoice by visit the link

async function sendInvoices() {
    // Fetch all invoicableIds for draftOrders that have InvoiceStatus
    const invoicedDraftOrderIds = await prisma.invoiceStatus.findMany({
        where: {
            invoicableType: 'draftOrder'
        },
        select: {
            invoicableId: true
        }
    });

    // Extract only the ids for the next query
    const invoicedIds = invoicedDraftOrderIds.map(invoice => invoice.invoicableId);

    // Find all draftOrders not in the invoicedIds list
    const unsentDraftOrders = await prisma.draftOrder.findMany({
        where: {
            NOT: {
                id: {
                    in: invoicedIds
                }
            }
        }
    });

    // Now, process your unsentDraftOrders and send invoices for each...

    // // Once the invoice is sent for a draftOrder, create an entry in InvoiceStatus
    // for (const draftOrder of unsentDraftOrders) {
    //     // Your logic to send invoice for each draftOrder...
    //
    //     // Once the invoice is sent, create a new InvoiceStatus
    //     await prisma.invoiceStatus.create({
    //         data: {
    //             invoicableType: 'draftOrder',
    //             invoicableId: draftOrder.id,
    //             // add other required fields here...
    //         }
    //     });
    // }
}

cron.schedule('0 1 * * *', function() {
    console.log('Running the send invoices job...');
    // sendInvoices();
});
