module.exports = {
  style: {
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        assert: false,
        crypto: false,
        http: false,
        https: false,
        http2: false,
        path: false,
        stream: false,
        url: false,
        util: false,
        zlib: false,
      };
      return webpackConfig;
    },
  },
};
