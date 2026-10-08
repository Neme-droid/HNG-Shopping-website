// Lets the mobile app import the website's framework-free modules (../lib/products.ts,
// checkout-schema.ts, auth-schema.ts) so the catalogue and validation rules live in ONE place.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const webRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), path.join(webRoot, 'lib')];
// Resolve packages (zod, react...) from mobile/node_modules only, even for files that live in ../lib,
// so there is never a second copy of React or Zod in the bundle.
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
