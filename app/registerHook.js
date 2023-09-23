const Shopify = require('shopify-api-node');

// Set up the Shopify client
const shopify = new Shopify({
    shopName: 'YOUR_SHOP_NAME.myshopify.com', // Replace with your shop name
    apiKey: 'YOUR_API_KEY', // Replace with your API key
    password: 'YOUR_API_PASSWORD', // Replace with your API password
    autoLimit: true // Automatically limits requests rate depending upon rate limit
});

async function registerDraftOrdersCreateWebhook() {
    try {
        const webhook = await shopify.webhook.create({
            topic: 'draft_orders/create',
            address: 'https://YOUR_APP_ENDPOINT_URL/webhook/draft_orders_create', // Replace with your app's endpoint URL
            format: 'json'
        });

        console.log('Successfully registered webhook: ', webhook);
    } catch (error) {
        console.error('Failed to register webhook: ', error);
    }
}

// Register the webhook
registerDraftOrdersCreateWebhook();
