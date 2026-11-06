import type { ConfigType } from '@plone/registry';
import { markLogin, passwordChange } from '../middleware/passwordChange';

export default function install(config: ConfigType) {
  config.settings.storeExtenders = [
    ...(config.settings.storeExtenders ?? []),
    // markLogin before and passwordChange after Volto's api middleware
    (stack) => [markLogin, ...stack, passwordChange],
  ];

  return config;
}
