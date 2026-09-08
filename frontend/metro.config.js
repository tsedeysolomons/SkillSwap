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

// Configure Metro cache with better settings
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: require('path').join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

// Add server configuration for better symbolication performance
config.server = {
  ...config.server,
  // Enable response streaming for faster initial bytes
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Enable immediate flushing for symbolicate endpoint
      if (req.url && req.url.includes('/symbolicate')) {
        res.flushHeaders();
      }
      return middleware(req, res, next);
    };
  },
};

// Optimize symbolication specifically
config.symbolicator = {
  ...config.symbolicator,
  // Cache symbolicated results
  customizeFrame: (frame) => {
    // Skip symbolication for node_modules to speed up
    if (frame.file && frame.file.includes('node_modules')) {
      return { collapse: true };
    }
    return frame;
  },
};

module.exports = config;
