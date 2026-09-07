import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    vitePluginBundleObfuscator({
      enable: true,
      log: true,
      autoExcludeNodeModules: true,
      threadPool: true,

      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,

        deadCodeInjection: false,

        debugProtection: false,
        debugProtectionInterval: 0,

        disableConsoleOutput: false,

        identifierNamesGenerator: 'hexadecimal',

        log: false,
        numbersToExpressions: false,
        renameGlobals: false,

        selfDefending: true,
        simplify: true,

        splitStrings: false,

        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,

        unicodeEscapeSequence: false,
      },
    }),
  ],

  build: {
    sourcemap: false,
  },
})