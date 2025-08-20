const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/{electron-store,conf,schema-utils}/**"
    },
    name: 'Med-Manager',
    executableName: 'med-manager',
    // No need to unpack Google AI modules since we're bundling them
    extraResource: ['./index.html'],
    extraFiles: [
      {
        from: 'index.html',
        to: 'index.html'
      },
      {
        from: 'dist/',
        to: 'dist/'
      }
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'med-manager',
        setupExe: 'MedManagerSetup.exe',
        authors: 'markc',
        description: 'Medical Manager Application',
      },
    },
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
    {
      name: '@electron-forge/maker-deb',
      config: {
        maintainer: 'markc',
        homepage: 'https://github.com/markc/youtube-scanner',
        description: 'YouTube Scanner Application',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        license: 'MIT',
        homepage: 'https://github.com/markc/med-manager',
        description: 'Medical Manager Application',
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          { 
            name: 'main_window', 
            config: 'vite.renderer.config.mjs',
            entryPoints: [
              {
                html: 'index.html',
                js: 'src/renderer.js',
                name: 'main_window',
                preload: {
                  js: 'src/preload.js',
                },
              },
            ],
          },
        ],
      },
    },
    // Optional Fuse config if you uncomment:
    // new FusesPlugin({
    //   version: FuseVersion.V1,
    //   [FuseV1Options.RunAsNode]: false,
    //   ...
    // }),
  ],
};