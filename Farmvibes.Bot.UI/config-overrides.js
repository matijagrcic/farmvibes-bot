const webpack = require("webpack");
const path = require("path-browserify");

module.exports = function override(config) {
  const scopePluginIndex = config.resolve.plugins.findIndex(
    ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
  );

  config.resolve.plugins.splice(scopePluginIndex, 1);

  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    path: require.resolve("path-browserify"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ]);

  return config;
};
