import { flattenObject, prefixPluginTranslations } from '@sensinum/strapi-utils';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { PLUGIN_ID } from './pluginId';

import { en } from './translations';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
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
