const svelte = require('svelte/compiler');
const svelteRollupPlugin = require('rollup-plugin-svelte');
const fs = require('fs');
const path = require('path');

const snowpackConfigDefault = {
  installOptions: { rollup: { plugins: [] }},
  buildOptions:{},
}

module.exports = function plugin(snowpackConfig = snowpackConfigDefault, pluginOptions = {}) {
  const isDev = process.env.NODE_ENV !== 'production';
  let svelteOptions;
  let preprocessOptions;
  let installExtensions;
  let extensions = [];

  const userSvelteConfigLoc = path.join(process.cwd(), 'svelte.config.js');
  if (fs.existsSync(userSvelteConfigLoc)) {
    const userSvelteConfig = require(userSvelteConfigLoc);
    const {preprocess, install, ..._svelteOptions} = userSvelteConfig;
    preprocessOptions = preprocess;
    installExtensions = install;
    svelteOptions = _svelteOptions;
  }

  if (installExtensions) {
    console.log('pluginOptions: ', pluginOptions.install)
  }

  if (snowpackConfig.installOptions && snowpackConfig.installOptions.rollup && snowpackConfig.installOptions.rollup.plugins){
    // Support importing Svelte files when you install dependencies.
    snowpackConfig.installOptions.rollup.plugins.push(
      svelteRollupPlugin({
        dev: isDev,
        include: '**/node_modules/**',
        extensions: ['.svelte', ...extensions],
        preprocess: preprocessOptions
      })
    )
  }

  // Generate svelte options from user provided config (if given)
  svelteOptions = {
    dev: isDev,
    css: false,
    ...svelteOptions,
    ...pluginOptions,
  };

  return {
    name: '@snowpack/plugin-svelte',
    resolve: {
      input: ['.svelte', ...extensions],
      output: ['.js', '.css'],
      install: installExtensions
    },
    knownEntrypoints: ['svelte/internal'],
    async load({filePath, isSSR}) {
      let codeToCompile = fs.readFileSync(filePath, 'utf-8');
      // PRE-PROCESS
      if (preprocessOptions) {
        codeToCompile = (
          await svelte.preprocess(codeToCompile, preprocessOptions, {
            filename: filePath,
          })
        ).code;
      }
      // COMPILE
      const ssrOptions = {};
      if (isSSR) {
        ssrOptions.generate = 'ssr';
        ssrOptions.hydratable = true;
        ssrOptions.css = true;
      }

      const {js, css} = svelte.compile(codeToCompile, {
        ...svelteOptions,
        ...ssrOptions,
        outputFilename: filePath,
        filename: filePath,
      });

      const {sourceMaps} = snowpackConfig.buildOptions;
      const output = {
        '.js': {
          code: js.code,
          map: sourceMaps ? js.map : undefined,
        },
      };
      if (!svelteOptions.css && css && css.code) {
        output['.css'] = {
          code: css.code,
          map: sourceMaps ? css.map : undefined,
        };
      }
      return output;
    },
  };
};
