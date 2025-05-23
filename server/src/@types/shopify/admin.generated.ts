/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types';

export type CreateWebhookSubscriptionFragmentFragment = { webhookSubscription?: AdminTypes.Maybe<(
    Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
    & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
      { __typename: 'WebhookHttpEndpoint' }
      & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
    ) }
  )>, userErrors: Array<(
    { __typename: 'UserError' }
    & Pick<AdminTypes.UserError, 'field' | 'message'>
  )> };

export type UpdateWebhookSubscriptionFragmentFragment = { webhookSubscription?: AdminTypes.Maybe<(
    Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
    & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
      { __typename: 'WebhookHttpEndpoint' }
      & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
    ) }
  )>, userErrors: Array<(
    { __typename: 'UserError' }
    & Pick<AdminTypes.UserError, 'field' | 'message'>
  )> };

export type CreateSingleSubscriptionMutationVariables = AdminTypes.Exact<{
  topic: AdminTypes.WebhookSubscriptionTopic;
  webhookSubscription: AdminTypes.WebhookSubscriptionInput;
}>;


export type CreateSingleSubscriptionMutation = { webhookSubscriptionCreate?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }> };

export type DeleteSubscriptionMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type DeleteSubscriptionMutation = { webhookSubscriptionDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.WebhookSubscriptionDeletePayload, 'deletedWebhookSubscriptionId'>
    & { userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }
  )> };

export type WebhooksQueryVariables = AdminTypes.Exact<{
  callbackUrl: AdminTypes.Scalars['URL']['input'];
  topics?: AdminTypes.InputMaybe<Array<AdminTypes.WebhookSubscriptionTopic> | AdminTypes.WebhookSubscriptionTopic>;
}>;


export type WebhooksQuery = { webhookSubscriptions: { nodes: Array<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { apiVersion: Pick<AdminTypes.ApiVersion, 'supported' | 'displayName'>, endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, edges: Array<(
      Pick<AdminTypes.WebhookSubscriptionEdge, 'cursor'>
      & { node: Pick<AdminTypes.WebhookSubscription, 'id'> }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor'> } };

export type ProductFragmentFragment = (
  Pick<AdminTypes.Product, 'id' | 'tags' | 'title' | 'handle' | 'createdAt' | 'updatedAt' | 'description' | 'descriptionHtml'>
  & { translations: Array<(
    Pick<AdminTypes.Translation, 'locale' | 'key' | 'value'>
    & { market?: AdminTypes.Maybe<(
      Pick<AdminTypes.Market, 'id' | 'name'>
      & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
    )> }
  )>, priceRangeV2: { maxVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { nodes: Array<(
      Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'updatedAt' | 'createdAt' | 'displayName' | 'availableForSale' | 'barcode' | 'compareAtPrice'>
      & { image?: AdminTypes.Maybe<(
        Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>
        & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
      )> }
    )> }, featuredMedia?: AdminTypes.Maybe<(
    Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
    & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
  ) | (
    Pick<AdminTypes.MediaImage, 'id' | 'alt'>
    & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
  ) | (
    Pick<AdminTypes.Model3d, 'id' | 'alt'>
    & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
  ) | (
    Pick<AdminTypes.Video, 'id' | 'alt'>
    & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
  )>, category?: AdminTypes.Maybe<Pick<AdminTypes.TaxonomyCategory, 'id' | 'name' | 'isRoot' | 'isArchived'>>, media: { nodes: Array<(
      Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.MediaImage, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.Model3d, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.Video, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    )> } }
);

export type ProductsQueryVariables = AdminTypes.Exact<{
  ids: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;


export type ProductsQuery = { nodes: Array<AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'id' | 'tags' | 'title' | 'handle' | 'createdAt' | 'updatedAt' | 'description' | 'descriptionHtml'>
    & { translations: Array<(
      Pick<AdminTypes.Translation, 'locale' | 'key' | 'value'>
      & { market?: AdminTypes.Maybe<(
        Pick<AdminTypes.Market, 'id' | 'name'>
        & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
      )> }
    )>, priceRangeV2: { maxVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { nodes: Array<(
        Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'updatedAt' | 'createdAt' | 'displayName' | 'availableForSale' | 'barcode' | 'compareAtPrice'>
        & { image?: AdminTypes.Maybe<(
          Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>
          & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
        )> }
      )> }, featuredMedia?: AdminTypes.Maybe<(
      Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.MediaImage, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.Model3d, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    ) | (
      Pick<AdminTypes.Video, 'id' | 'alt'>
      & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
    )>, category?: AdminTypes.Maybe<Pick<AdminTypes.TaxonomyCategory, 'id' | 'name' | 'isRoot' | 'isArchived'>>, media: { nodes: Array<(
        Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.MediaImage, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.Model3d, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.Video, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      )> } }
  )>> };

export type SearchProductsQueryVariables = AdminTypes.Exact<{
  query: AdminTypes.Scalars['String']['input'];
}>;


export type SearchProductsQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'tags' | 'title' | 'handle' | 'createdAt' | 'updatedAt' | 'description' | 'descriptionHtml'>
      & { translations: Array<(
        Pick<AdminTypes.Translation, 'locale' | 'key' | 'value'>
        & { market?: AdminTypes.Maybe<(
          Pick<AdminTypes.Market, 'id' | 'name'>
          & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
        )> }
      )>, priceRangeV2: { maxVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<AdminTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'updatedAt' | 'createdAt' | 'displayName' | 'availableForSale' | 'barcode' | 'compareAtPrice'>
          & { image?: AdminTypes.Maybe<(
            Pick<AdminTypes.Image, 'id' | 'altText' | 'url'>
            & { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'value'>> } }
          )> }
        )> }, featuredMedia?: AdminTypes.Maybe<(
        Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.MediaImage, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.Model3d, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      ) | (
        Pick<AdminTypes.Video, 'id' | 'alt'>
        & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
      )>, category?: AdminTypes.Maybe<Pick<AdminTypes.TaxonomyCategory, 'id' | 'name' | 'isRoot' | 'isArchived'>>, media: { nodes: Array<(
          Pick<AdminTypes.ExternalVideo, 'id' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
        ) | (
          Pick<AdminTypes.MediaImage, 'id' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
        ) | (
          Pick<AdminTypes.Model3d, 'id' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
        ) | (
          Pick<AdminTypes.Video, 'id' | 'alt'>
          & { preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }> }
        )> } }
    )>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

interface GeneratedQueryTypes {
  "\n    #graphql\n    query webhooks($callbackUrl: URL!, $topics: [WebhookSubscriptionTopic!]) {\n        webhookSubscriptions(first: 100, callbackUrl: $callbackUrl, topics: $topics) {\n            nodes {\n                id\n                apiVersion {\n                    supported\n                    displayName\n                }\n                topic\n                format\n                endpoint {\n                    __typename\n                    ... on WebhookHttpEndpoint {\n                        callbackUrl\n                    }\n                }\n            }\n            edges {\n                cursor\n                node {\n                    id\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n            }\n        }\n    }\n": {return: WebhooksQuery, variables: WebhooksQueryVariables},
  "\n              #graphql\n              \n    #graphql\n    fragment ProductFragment on Product {\n        id\n        tags\n        title\n        handle\n        createdAt\n        updatedAt\n        description\n        descriptionHtml\n        translations(locale: \"en\") {\n            locale\n            key\n            value\n            market {\n                id\n                name\n                metafields(first: 10) {\n                    nodes {\n                        id\n                        key\n                        value\n                    }\n                }\n            }\n        }\n        priceRangeV2 {\n            maxVariantPrice {\n                amount\n                currencyCode\n            }\n            minVariantPrice {\n                amount\n                currencyCode\n            }\n        }\n        variants(first: 100) {\n            nodes {\n                id\n                title\n                updatedAt\n                createdAt\n                displayName\n                availableForSale\n                barcode\n                compareAtPrice\n                image {\n                    id\n                    altText\n                    url\n                    metafields(first: 10) {\n                        nodes {\n                            id\n                            key\n                            value\n                        }\n                    }\n                }\n            }\n        }\n        featuredMedia {\n            id\n            alt\n            preview {\n                image {\n                    url\n                }\n            }\n        }\n        category {\n            id\n            name\n            isRoot\n            isArchived\n        }\n        media(first: 10) {\n            nodes {\n                id\n                alt\n                preview {\n                    image {\n                        url\n                    }\n                }\n            }\n        }\n    }\n\n              query Products($ids: [ID!]!) {\n                  nodes(ids: $ids) {\n                      ... ProductFragment                  }\n              }\n        ": {return: ProductsQuery, variables: ProductsQueryVariables},
  "\n              #graphql\n              \n    #graphql\n    fragment ProductFragment on Product {\n        id\n        tags\n        title\n        handle\n        createdAt\n        updatedAt\n        description\n        descriptionHtml\n        translations(locale: \"en\") {\n            locale\n            key\n            value\n            market {\n                id\n                name\n                metafields(first: 10) {\n                    nodes {\n                        id\n                        key\n                        value\n                    }\n                }\n            }\n        }\n        priceRangeV2 {\n            maxVariantPrice {\n                amount\n                currencyCode\n            }\n            minVariantPrice {\n                amount\n                currencyCode\n            }\n        }\n        variants(first: 100) {\n            nodes {\n                id\n                title\n                updatedAt\n                createdAt\n                displayName\n                availableForSale\n                barcode\n                compareAtPrice\n                image {\n                    id\n                    altText\n                    url\n                    metafields(first: 10) {\n                        nodes {\n                            id\n                            key\n                            value\n                        }\n                    }\n                }\n            }\n        }\n        featuredMedia {\n            id\n            alt\n            preview {\n                image {\n                    url\n                }\n            }\n        }\n        category {\n            id\n            name\n            isRoot\n            isArchived\n        }\n        media(first: 10) {\n            nodes {\n                id\n                alt\n                preview {\n                    image {\n                        url\n                    }\n                }\n            }\n        }\n    }\n\n              query searchProducts($query: String!) {\n                  products(first: 20, query: $query) {\n                      nodes {\n                          ... ProductFragment\n                      }\n                      pageInfo {\n                          hasNextPage\n                          endCursor\n                      }\n                  }\n              }\n        ": {return: SearchProductsQuery, variables: SearchProductsQueryVariables},
}

interface GeneratedMutationTypes {
  "\n    #graphql \n    \n    #graphql\n    fragment CreateWebhookSubscriptionFragment on WebhookSubscriptionCreatePayload {\n        webhookSubscription {\n            id\n            topic\n            format\n            endpoint {\n                __typename\n                ... on WebhookHttpEndpoint {\n                    callbackUrl\n                }\n            }\n        }\n        userErrors {\n            field\n            message\n            __typename\n        }\n    }\n\n    mutation createSingleSubscription(\n        $topic: WebhookSubscriptionTopic!,\n        $webhookSubscription: WebhookSubscriptionInput!\n    ) {\n        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {\n            ...CreateWebhookSubscriptionFragment\n        }\n    }\n": {return: CreateSingleSubscriptionMutation, variables: CreateSingleSubscriptionMutationVariables},
  "\n    #graphql\n    mutation deleteSubscription($id: ID!) {\n        webhookSubscriptionDelete(id: $id) {\n            deletedWebhookSubscriptionId\n            userErrors {\n                field\n                message\n                __typename\n            }\n        }\n    }\n": {return: DeleteSubscriptionMutation, variables: DeleteSubscriptionMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
