import { Core } from '@strapi/strapi';
import { getHost } from '../getHost';
import { PluginConfig } from '../../config/schema';

const getStrapiMock = (config?: PluginConfig): Core.Strapi =>
  ({
    config: {
      get: jest.fn().mockReturnValue(config),
    },
  }) as unknown as Core.Strapi;

describe('getHost', () => {
  it('should retrieve the host from plugin configuration', () => {
    // Arrange
    const mockConfig: PluginConfig = {
      host: 'https://test-shop.myshopify.com',
      engine: 'memory',
    };

    const mockStrapi = getStrapiMock(mockConfig);

    // Act
    const result = getHost(mockStrapi);

    // Assert
    expect(result).toBe('https://test-shop.myshopify.com');
  });

  it('should return undefined when config is not found', () => {
    // Arrange
    const mockStrapi = getStrapiMock();

    // Act
    const result = getHost(mockStrapi);

    // Assert
    expect(result).toBeUndefined();
  });
});
