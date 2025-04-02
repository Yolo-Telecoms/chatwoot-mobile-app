// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          // This can help Babel pick up TS/TSX files:
          extensions: ['.ts', '.tsx', '.js', '.json'],
        },
      ],
    ],
  };
};
