const path = require('path');
const plugin = require('../plugin');

test('svelte plugin base', async () => {
  const pluginInstance = plugin();
  const pluginLoad = pluginInstance.load;
  const codeFilePath = path.resolve(__dirname, './stubs/SvelteContent.svelte');
  const resultContent = await pluginLoad({
    filePath: codeFilePath,
  });
  expect.objectContaining({
    code: expect.any(Object),
    js: expect.any(Object),
  }),
  expect(resultContent).toMatchSnapshot();
});

test('svelte plugin base has styles', async () => {
  const pluginInstance = plugin({
    buildOptions: {
      sourceMap: true,
    },
  });
  const pluginLoad = pluginInstance.load;
  const codeFilePath = path.resolve(__dirname, './stubs/SvelteContent.svelte');
  const resultContent = await pluginLoad({
    filePath: codeFilePath,
  });
  expect(resultContent['.css'].code).toMatch(/.App/);
  expect(resultContent['.css'].code).toMatch(/.App-header/);
});
