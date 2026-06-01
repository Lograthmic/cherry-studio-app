const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');
config.watchFolders.push(
  path.resolve(__dirname, 'packages'),
  path.resolve(__dirname, 'node_modules/react-native-worklets/.worklets'),
);

const bundleModeConfig = getBundleModeMetroConfig(config);
const bundleModeResolver = bundleModeConfig.resolver.resolveRequest;

const uniwindConfig = withUniwindConfig(bundleModeConfig, {
  cssEntryFile: './src/styles/global.css',
  dtsFile: './src/types/uniwind-types.d.ts',
});

const uniwindResolver = uniwindConfig.resolver.resolveRequest;

uniwindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('react-native-worklets/.worklets/')) {
    return bundleModeResolver(context, moduleName, platform);
  }

  return uniwindResolver(context, moduleName, platform);
};

module.exports = uniwindConfig;
