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

export type CreateAllProductsMutationVariables = AdminTypes.Exact<{
  createTopic: AdminTypes.WebhookSubscriptionTopic;
  updateTopic: AdminTypes.WebhookSubscriptionTopic;
  removeTopic: AdminTypes.WebhookSubscriptionTopic;
  webhookSubscription: AdminTypes.WebhookSubscriptionInput;
}>;


export type CreateAllProductsMutation = { create?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }>, update?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }>, remove?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }> };

export type UpdateProductsMutationVariables = AdminTypes.Exact<{
  topic: AdminTypes.WebhookSubscriptionTopic;
  webhookSubscription: AdminTypes.WebhookSubscriptionInput;
}>;


export type UpdateProductsMutation = { webhookSubscriptionCreate?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
      Pick<AdminTypes.WebhookSubscription, 'id' | 'topic' | 'format'>
      & { endpoint: { __typename: 'WebhookEventBridgeEndpoint' | 'WebhookPubSubEndpoint' } | (
        { __typename: 'WebhookHttpEndpoint' }
        & Pick<AdminTypes.WebhookHttpEndpoint, 'callbackUrl'>
      ) }
    )>, userErrors: Array<(
      { __typename: 'UserError' }
      & Pick<AdminTypes.UserError, 'field' | 'message'>
    )> }> };

export type UpdateSubscriptionMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  webhookSubscription: AdminTypes.WebhookSubscriptionInput;
}>;


export type UpdateSubscriptionMutation = { webhookSubscriptionUpdate?: AdminTypes.Maybe<{ webhookSubscription?: AdminTypes.Maybe<(
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

interface GeneratedQueryTypes {
  "\n    #graphql\n    query webhooks($callbackUrl: URL!, $topics: [WebhookSubscriptionTopic!]) {\n        webhookSubscriptions(first: 100, callbackUrl: $callbackUrl, topics: $topics) {\n            nodes {\n                id\n                apiVersion {\n                    supported\n                    displayName\n                }\n                topic\n                format\n                endpoint {\n                    __typename\n                    ... on WebhookHttpEndpoint {\n                        callbackUrl\n                    }\n                }\n            }\n            edges {\n                cursor\n                node {\n                    id\n                }\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n            }\n        }\n    }\n": {return: WebhooksQuery, variables: WebhooksQueryVariables},
}

interface GeneratedMutationTypes {
  "\n    #graphql \n    \n    #graphql\n    fragment CreateWebhookSubscriptionFragment on WebhookSubscriptionCreatePayload {\n        webhookSubscription {\n            id\n            topic\n            format\n            endpoint {\n                __typename\n                ... on WebhookHttpEndpoint {\n                    callbackUrl\n                }\n            }\n        }\n        userErrors {\n            field\n            message\n            __typename\n        }\n    }\n\n    mutation createAllProducts(\n        $createTopic: WebhookSubscriptionTopic!,\n        $updateTopic: WebhookSubscriptionTopic!,\n        $removeTopic: WebhookSubscriptionTopic!,\n        $webhookSubscription: WebhookSubscriptionInput!\n    ) {\n        create: webhookSubscriptionCreate(topic: $createTopic, webhookSubscription: $webhookSubscription) {\n            ...CreateWebhookSubscriptionFragment\n        }\n        update: webhookSubscriptionCreate(topic: $updateTopic, webhookSubscription: $webhookSubscription) {\n            ...CreateWebhookSubscriptionFragment\n        }\n        remove: webhookSubscriptionCreate(topic: $removeTopic, webhookSubscription: $webhookSubscription) {\n            ...CreateWebhookSubscriptionFragment\n        }\n    }\n": {return: CreateAllProductsMutation, variables: CreateAllProductsMutationVariables},
  "\n    #graphql \n    \n    #graphql\n    fragment CreateWebhookSubscriptionFragment on WebhookSubscriptionCreatePayload {\n        webhookSubscription {\n            id\n            topic\n            format\n            endpoint {\n                __typename\n                ... on WebhookHttpEndpoint {\n                    callbackUrl\n                }\n            }\n        }\n        userErrors {\n            field\n            message\n            __typename\n        }\n    }\n\n    mutation updateProducts(\n        $topic: WebhookSubscriptionTopic!,\n        $webhookSubscription: WebhookSubscriptionInput!\n    ) {\n        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {\n            ...CreateWebhookSubscriptionFragment\n        }\n    }\n": {return: UpdateProductsMutation, variables: UpdateProductsMutationVariables},
  "\n    #graphql\n    \n    #graphql\n    fragment UpdateWebhookSubscriptionFragment on WebhookSubscriptionUpdatePayload {\n        webhookSubscription {\n            id\n            topic\n            format\n            endpoint {\n                __typename\n                ... on WebhookHttpEndpoint {\n                    callbackUrl\n                }\n            }\n        }\n        userErrors {\n            field\n            message\n            __typename\n        }\n    }\n\n    mutation updateSubscription($id: ID!, $webhookSubscription: WebhookSubscriptionInput!) {\n        webhookSubscriptionUpdate(id: $id, webhookSubscription: $webhookSubscription) {\n            ...UpdateWebhookSubscriptionFragment\n        }\n\n    }\n": {return: UpdateSubscriptionMutation, variables: UpdateSubscriptionMutationVariables},
  "\n    #graphql\n    mutation deleteSubscription($id: ID!) {\n        webhookSubscriptionDelete(id: $id) {\n            deletedWebhookSubscriptionId\n            userErrors {\n                field\n                message\n                __typename\n            }\n        }\n    }\n": {return: DeleteSubscriptionMutation, variables: DeleteSubscriptionMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
