import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getIdToken } from '@/lib/auth';

const URL = process.env.NEXT_PUBLIC_APPSYNC_URL;
const httpLink = createHttpLink({
    uri: URL || 'http://localhost:4000/graphql', // Fallback for local dev/initial setup
});

const authLink = setContext(async (_, { headers }) => {
    const token = typeof window !== 'undefined' ? await getIdToken() : null;
    return {
        headers: {
            ...headers,
            Authorization: token || '',
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
