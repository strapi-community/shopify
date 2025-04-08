import { getCorrectSuffix } from '../getCorrectSuffix';
import { WebhookSubscriptionTopic } from '../../@types/shopify';
import { HOOK_TYPE } from '../../const';

describe('getCorrectSuffix', () => {
  it('should return common path suffix for product webhooks', () => {
    // Arrange
    const topics = [
      WebhookSubscriptionTopic.ProductsCreate,
      WebhookSubscriptionTopic.ProductsUpdate,
      WebhookSubscriptionTopic.ProductsDelete,
    ] as const;

    // Act & Assert
    topics.forEach((topic) => {
      expect(getCorrectSuffix(topic)).toBe(HOOK_TYPE.COMMON.pathSuffix);
    });
  });

  it('should throw error for invalid topic', () => {
    // Arrange
    const invalidTopic = 'INVALID_TOPIC' as any;

    // Act & Assert
    expect(() => getCorrectSuffix(invalidTopic)).toThrow('Invalid topic');
  });
});
