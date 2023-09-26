const cron = require('node-cron');

// const { sendInvoices } = require('../path_to_your_invoice_logic');

// This will run every day at 1am
cron.schedule('0 1 * * *', function() {
    console.log('Running the send invoices job...');
    // sendInvoices();
});
