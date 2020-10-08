const path = require('path');
const plugin = require('../plugin');

describe('svelte plugin preprocess', () => {
  test('compiles ts in .svelte', async () => {
    const pluginInstance = plugin({}, {
      configDir: './plugins/plugin-svelte/test/stubs/ts'
    });
    const pluginLoad = pluginInstance.load;
    const codeFilePath = path.resolve(__dirname, './stubs/ts/SvelteContentTS.svelte');
    const resultContent = await pluginLoad({
      filePath: codeFilePath,
    });
    expect(resultContent).toMatchSnapshot();
  });
})