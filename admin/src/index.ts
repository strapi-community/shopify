import { flattenObject, prefixPluginTranslations } from '@sensinum/strapi-utils';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { PLUGIN_ID } from './pluginId';

import { en, getTradId, TranslationPath } from './translations';

import pluginPermissions from './utils/permissions';

export default {
  register(app: any) {
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.plugin.section.name`,
          defaultMessage: `Shopify plugin`,
        },
      },
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.plugin.section.item`,
            defaultMessage: 'Shops',
          },
          id: 'navigation',
          to: PLUGIN_ID,
          permissions: pluginPermissions.settings,
          Component: async () => {
            const { App } = await import('./pages/App');

            return App;
          },
        },
      ]
    );

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    const customFieldLabel: TranslationPath = 'customField.label';
    const customFieldDescription: TranslationPath = 'customField.label';

    app.customFields.register({
      name: 'product',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: getTradId(customFieldLabel),
      },
      intlDescription: {
        id: getTradId(customFieldDescription),
      },
      components: {
        Input: async () =>
          import(/* webpackChunkName: "product-input-component" */ './components/ProductInput'),
      },
      options: {
        // TODO?: specific shop pick
        // declare options here
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const trads = { en };

    return Promise.all(
      locales.map(async (locale: string) => {
        if (locale in trads) {
          const typedLocale = locale as keyof typeof trads;
          return trads[typedLocale]().then(({ default: trad }) => {
            return {
              data: prefixPluginTranslations(flattenObject(trad), PLUGIN_ID),
              locale,
            };
          });
        }
        return {
          data: prefixPluginTranslations(flattenObject({}), PLUGIN_ID),
          locale,
        };
      })
    );
  },
};
