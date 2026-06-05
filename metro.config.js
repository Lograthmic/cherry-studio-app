const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode');
const { withUniwindConfig } = require('uniwind/metro');

let config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');
config.watchFolders.push(path.resolve(__dirname, 'packages'));
config.watchFolders.push(path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'));

const defaultResolver = config.resolver.resolveRequest;

config = getBundleModeMetroConfig(config);

const bundleModeResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-worklets/.worklets/')) {
    return bundleModeResolver(context, moduleName, platform);
  }

  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/styles/global.css',
  dtsFile: './src/types/uniwind-types.d.ts',
});
