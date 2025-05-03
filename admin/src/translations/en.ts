const en = {
  header: {
    shop: {
      new: {
        tabTitle: 'New Shop',
        title: 'New Shop',
      },

      edit: {
        tabTitle: 'Editing Shop: {shopName}',
        title: 'Editing Shop: {shopName}',
      },
    },
  },

  form: {
    shop: {
      address: {
        label: "Shop's address",
        placeholder: 'For example: https://acme.myshopify.com',
        errorRequired: 'You need to specify an address of the shop',
        errorUrl: 'Address needs to be a valid URL',
      },

      vendor: {
        label: 'Vendor',
        placeholder: "Shop's name",
        errorRequired: 'This field is required',
      },

      apiKey: {
        label: 'API Key',
        placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        errorRequired: 'This field is required',
        errorLength: 'This key is too short',
      },

      apiSecretKey: {
        label: 'API Secret key',
        placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        errorRequired: 'This field is required',
        errorLength: 'This key is too short',
      },

      adminApiAccessToken: {
        label: 'Admin API Access Token',
        placeholder: 'shpat_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        errorRequired: 'This field is required',
        errorLength: 'This key is too short',
        errorFormat: 'This token has invalid format',
      },

      webhooks: {
        label: 'Webhooks',
        add: 'Add a webhook',
        error: 'This field is required',

        service: 'Service',
        method: 'Method',
        topic: 'Topic',

        notFound: 'Not found',

        inconsistentConfigError: 'Invalid service - method configuration',
        serviceInvalidNameError:
          'Invalid service name. Allowed values: admin::, api::[a-zA-Z0-9_-]+\.[a-zA-Z0-9_\\-]+, plugin::[a-zA-Z0-9_\\-]+\.[a-zA-Z0-9_\\-]+',

        delete: {
          dialog: {
            body: 'Are you sure you want to delete this webhook?',
            cancel: 'Cancel',
            confirm: 'Delete',
          },
        },
      },

      save: 'Save',

      delete: {
        button: 'Delete',
        dialog: {
          body: 'Are you sure you want to delete this shop?',
          cancel: 'Cancel',
          confirm: 'Delete',
        },
      },

      saved: {
        new: {
          header: 'New shop has been added',
          content:
            'Your shop has been created and configured. You can now edit or delete this shop.',
        },
        update: {
          header: 'Shop has been updated',
          content:
            'Your shop has been updated and configured. You can continue editing or delete this shop.',
        },
      },

      deleted: {
        header: 'Shop has been removed',
        content: 'Your shop has been removed. You can create a new one now.',
      },

      error: {
        validationMessage: 'Shop configuration has issues. Check form items.',
      },
    },
  },

  customField: {
    label: 'Shopify product',
    description: 'Add a shopify product to your entry',
    vendor: {
      placeholder: 'Select a vendor',
    },
    product: {
      placeholder: 'Select a product',
    },
  },

  plugin: {
    section: {
      name: 'Shopify plugin',
      item: 'Shops',
    },
  },
};

export default en;

export type EN = typeof en;
