const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .lottie animation files
config.resolver.assetExts = [...(config.resolver.assetExts ?? []), 'lottie'];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './app/uniwind-types.d.ts',
});
