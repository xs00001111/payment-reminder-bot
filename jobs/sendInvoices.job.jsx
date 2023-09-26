const cron = require('node-cron');

// const { sendInvoices } = require('../path_to_your_invoice_logic');

// This will run every day at 1am

//TODO:
// 1. get pending draft order
// 2. get schedule for this store
// 3. click send invoice by visit the link

cron.schedule('0 1 * * *', function() {
    console.log('Running the send invoices job...');
    // sendInvoices();
});
