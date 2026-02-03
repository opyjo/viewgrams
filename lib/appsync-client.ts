import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const URL = process.env.NEXT_PUBLIC_APPSYNC_URL;
const API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

const httpLink = createHttpLink({
    uri: URL || 'http://localhost:4000/graphql', // Fallback for local dev/initial setup
    headers: {
        'x-api-key': API_KEY || '',
    },
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
