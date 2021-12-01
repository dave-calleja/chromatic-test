const path = require('path');

module.exports = {
  stories: ["../src/**/*.stories.jsx"],
  addons: [
    "@storybook/addon-actions/register",
    "@storybook/addon-notes/register",
    "@storybook/addon-controls",
  ],
  webpackFinal: async (config) => {
    (config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [require.resolve("babel-preset-react-app")],
            },
          },
        ],
      },
    ]),
    
    config.resolve.extensions.push(".js", ".jsx");

    config.module.rules.push({
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', {
            loader: 'sass-loader',
        
            options: {
                additionalData: (content, loaderContext) => {
                    // More information about available properties https://webpack.js.org/api/loaders/
                    const { resourcePath, rootContext } = loaderContext;
                    const relativePath = path.relative(rootContext, resourcePath);
    
                    if (relativePath === "src/scss/base.scss") {
                      return content;
                    }
    
                    return `@import "../../scss/base.scss";` + content;
                  },
              }
        }],
      });

    config.module.rules.push({
        test: /\.css$/,
        use: ['css-loader', 'postcss-loader'],
      });
    
    return config;
  },
};
