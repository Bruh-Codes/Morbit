// Stub for @lingui/conf - prevents Node built-in imports in client bundles.
export function getConfig() {
  return {
    locales: ['en'],
    sourceLocale: 'en',
    catalogs: [],
    format: 'po',
  };
}

export function getConfigPath() {
  return null;
}

export default {};
