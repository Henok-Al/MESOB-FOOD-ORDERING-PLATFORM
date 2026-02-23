const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use root node_modules for shared packages but local for react-native
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// Force Metro to use driver's react-native, not root's
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
    return context.resolveRequest(
      { ...context, nodeModulesPaths: [path.resolve(__dirname, 'node_modules')] },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.disableHierarchicalLookup = false;

module.exports = config;
