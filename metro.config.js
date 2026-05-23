const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');
config.watchFolders.push(path.resolve(__dirname, 'packages'));

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/styles/global.css',
  dtsFile: './src/types/uniwind-types.d.ts',
});
