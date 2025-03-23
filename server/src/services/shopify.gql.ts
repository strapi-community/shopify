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

export const createSingleSubscriptionMutation = `
    #graphql 
    ${createSubscriptionFragment}
    mutation createSingleSubscription(
        $topic: WebhookSubscriptionTopic!,
        $webhookSubscription: WebhookSubscriptionInput!
    ) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            ...CreateWebhookSubscriptionFragment
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
export const getProductFragment = `
    #graphql
    fragment ProductFragment on Product {
        id
        tags
        title
        handle
        createdAt
        updatedAt
        description
        descriptionHtml
        translations(locale: "en") {
            locale
            key
            value
            market {
                id
                name
                metafields(first: 10) {
                    nodes {
                        id
                        key
                        value
                    }
                }
            }
        }
        priceRangeV2 {
            maxVariantPrice {
                amount
                currencyCode
            }
            minVariantPrice {
                amount
                currencyCode
            }
        }
        variants(first: 100) {
            nodes {
                id
                title
                updatedAt
                createdAt
                displayName
                availableForSale
                barcode
                compareAtPrice
                image {
                    id
                    altText
                    url
                    metafields(first: 10) {
                        nodes {
                            id
                            key
                            value
                        }
                    }
                }
            }
        }
        featuredMedia {
            id
            alt
            preview {
                image {
                    url
                }
            }
        }
        category {
            id
            name
            isRoot
            isArchived
        }
        media(first: 10) {
            nodes {
                id
                alt
                preview {
                    image {
                        url
                    }
                }
            }
        }
    }
`;
