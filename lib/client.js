import { createClient } from "@sanity/client";

export const client = createClient({
    projectId: '0wp724s1',
    dataset: 'production',
    apiVersion: '2025-03-25',
    useCdn: false,
    token: process.env.NEXT_PUBLIC_SANITY_TOKEN
});

