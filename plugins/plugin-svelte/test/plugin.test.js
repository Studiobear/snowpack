const path = require('path');
const plugin = require('../plugin');

const preprocessMock = jest.fn(x => x);
jest.mock('process', () => ({
  cwd: () => 'mocked value'
}));

describe('svelte plugin ', () => {
  test('compiles .svelte', async () => {
    const pluginInstance = plugin();
    const pluginLoad = pluginInstance.load;
    const codeFilePath = path.resolve(__dirname, './stubs/SvelteContent.svelte');
    const resultContent = await pluginLoad({
      filePath: codeFilePath,
    });
    expect(resultContent).toMatchSnapshot();
  });
  
  test('outputs CSS', async () => {
    const pluginInstance = plugin();
    const pluginLoad = pluginInstance.load;
    const codeFilePath = path.resolve(__dirname, './stubs/SvelteContent.svelte');
    const resultContent = await pluginLoad({
      filePath: codeFilePath,
    });
    expect(resultContent['.css'].code).toMatch(/.App/);
    expect(resultContent['.css'].code).toMatch(/.App-header/);
  });
  
  test('build options with sourcemaps', async () => {
    const pluginInstance = plugin({ buildOptions: { sourceMaps: true }});
    const pluginLoad = pluginInstance.load;
    const codeFilePath = path.resolve(__dirname, './stubs/SvelteContent.svelte');
    const resultContent = await pluginLoad({
      filePath: codeFilePath,
    });
  
    expect(resultContent['.css']).toEqual(
      expect.objectContaining({
        map: expect.any(Object),
      })
     ) 
    expect(resultContent['.js']).toEqual(
      expect.objectContaining({
        map: expect.any(Object),
      })
     ) 
     expect(resultContent['.js'].code.map).toMatchSnapshot();
  });

  test('installs extensions', async () => {
    const pluginInstance = plugin({}, {
      install: {'.md': ['HTML', 'SVELTE_VUE_REGEX'], '.svx': ['HTML', 'SVELTE_VUE_REGEX']},
    });
    const pluginResolve = pluginInstance.resolve;

    expect(pluginResolve).toEqual(
      expect.objectContaining({
        input: expect.any(Array),
        output: expect.any(Array),
        install: expect.any((Object || Array)),
      })
     ); 
  });
})
