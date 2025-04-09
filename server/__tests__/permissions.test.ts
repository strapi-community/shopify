import { Core } from '@strapi/strapi';
import { setupPermissions } from '../src/permissions';
import { PLUGIN_ID } from '../src/const';

const getMockStrapi = (): Core.Strapi =>
  ({
    admin: {
      services: {
        permission: {
          actionProvider: {
            registerMany: jest.fn(),
          },
        },
      },
    },
  }) as unknown as Core.Strapi;

describe('setupPermissions', () => {
  let strapi: Core.Strapi;

  beforeEach(() => {
    strapi = getMockStrapi();
    jest.clearAllMocks();
  });

  it('should register plugin permissions correctly', async () => {
    // Act
    await setupPermissions({ strapi });

    // Assert
    expect(strapi.admin.services.permission.actionProvider.registerMany).toHaveBeenCalledWith([
      {
        section: 'plugins',
        displayName: 'Settings',
        uid: 'settings',
        pluginName: PLUGIN_ID,
      },
    ]);
  });

  it('should handle errors from permission registration', async () => {
    // Arrange
    const error = new Error('Permission registration failed');
    strapi.admin.services.permission.actionProvider.registerMany.mockRejectedValue(error);

    // Act & Assert
    await expect(setupPermissions({ strapi })).rejects.toThrow('Permission registration failed');
  });
});
