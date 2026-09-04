const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize symbolication and source maps for faster development
config.transformer = {
  ...config.transformer,
  // Use faster source maps during development
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Improve resolver performance
config.resolver = {
  ...config.resolver,
  // Exclude node_modules from symbolication to speed up stack traces
  blacklistRE: /(node_modules\/.*\/node_modules\/react-native\/.*)/,
};

// Optimize watcher for better performance
config.watchFolders = [__dirname];

// Configure Metro cache
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: require('path').join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

module.exports = config;
