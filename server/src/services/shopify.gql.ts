const createSubscriptionFragment = `
    #graphql
    fragment CreateWebhookSubscriptionFragment on WebhookSubscriptionCreatePayload {
        webhookSubscription {
            id
            topic
            format
            endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                    callbackUrl
                }
            }
        }
        userErrors {
            field
            message
            __typename
        }
    }
`;
const updateSubscriptionFragment = `
    #graphql
    fragment UpdateWebhookSubscriptionFragment on WebhookSubscriptionUpdatePayload {
        webhookSubscription {
            id
            topic
            format
            endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                    callbackUrl
                }
            }
        }
        userErrors {
            field
            message
            __typename
        }
    }
`;

export const createAllSubscriptionMutation = `
    #graphql 
    ${createSubscriptionFragment}
    mutation createAllProducts(
        $createTopic: WebhookSubscriptionTopic!,
        $updateTopic: WebhookSubscriptionTopic!,
        $removeTopic: WebhookSubscriptionTopic!,
        $webhookSubscription: WebhookSubscriptionInput!
    ) {
        create: webhookSubscriptionCreate(topic: $createTopic, webhookSubscription: $webhookSubscription) {
            ...CreateWebhookSubscriptionFragment
        }
        update: webhookSubscriptionCreate(topic: $updateTopic, webhookSubscription: $webhookSubscription) {
            ...CreateWebhookSubscriptionFragment
        }
        remove: webhookSubscriptionCreate(topic: $removeTopic, webhookSubscription: $webhookSubscription) {
            ...CreateWebhookSubscriptionFragment
        }
    }
`;
export const createSingleSubscriptionMutation = `
    #graphql 
    ${createSubscriptionFragment}
    mutation updateProducts(
        $topic: WebhookSubscriptionTopic!,
        $webhookSubscription: WebhookSubscriptionInput!
    ) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            ...CreateWebhookSubscriptionFragment
        }
    }
`;

export const updateSubscription = `
    #graphql
    ${updateSubscriptionFragment}
    mutation updateSubscription($id: ID!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionUpdate(id: $id, webhookSubscription: $webhookSubscription) {
            ...UpdateWebhookSubscriptionFragment
        }

    }
`;
export const deleteSubscription = `
    #graphql
    mutation deleteSubscription($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
            deletedWebhookSubscriptionId
            userErrors {
                field
                message
                __typename
            }
        }
    }
`;

export const getWebhooksByCallbackURL = `
    #graphql
    query webhooks($callbackUrl: URL!, $topics: [WebhookSubscriptionTopic!]) {
        webhookSubscriptions(first: 100, callbackUrl: $callbackUrl, topics: $topics) {
            nodes {
                id
                apiVersion {
                    supported
                    displayName
                }
                topic
                format
                endpoint {
                    __typename
                    ... on WebhookHttpEndpoint {
                        callbackUrl
                    }
                }
            }
            edges {
                cursor
                node {
                    id
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
            }
        }
    }
`;
