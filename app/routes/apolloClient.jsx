import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';


const httpLink = new HttpLink({
    uri: 'https://quickstart-8f002a84.myshopify.com/admin/api/2023-07/graphql.json',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default client;
