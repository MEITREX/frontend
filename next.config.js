/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

 transpilePackages: [
  // 1. Hylimo Pakete
  "@hylimo/diagram-common",
  "@hylimo/diagram-protocol",
  "@hylimo/diagram-ui",
  "@hylimo/core",
  "@hylimo/diagram-render-pdf",
  "@hylimo/diagram-render-svg",
  "@hylimo/language-server",

  // 2. Monaco & VSCode Language Client
  "monaco-languageclient",
  "vscode-languageclient",
  "vscode-languageserver",
  "vscode-languageserver-protocol",
  "vscode-languageserver-types",
  "vscode-jsonrpc",

],



  output: "standalone",

  compiler: {
    relay: {
      src: "./",
      language: "typescript",
      artifactDirectory: "./__generated__",
    },
  },

  modularizeImports: {
    "@mui/icons-material/?(((\\w*)?/?)*)": {
      transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
    },
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });

    config.externals.push("canvas");

    return config;
  },
};

module.exports = nextConfig;
