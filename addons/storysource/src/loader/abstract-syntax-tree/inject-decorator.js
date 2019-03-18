import defaultOptions from './default-options';

import {
  generateSourceWithDecorators,
  generateSourceWithoutDecorators,
  generateStorySource,
  generateAddsMap,
  generateDependencies,
} from './generate-helpers';

function extendOptions(source, comments, filepath, options) {
  return {
    ...defaultOptions,
    ...options,
    source,
    comments,
    filepath,
  };
}

function inject(source, decorator, filepath, options = {}) {
  const { injectDecorator = true } = options;
  const obviouslyNotCode = ['md', 'txt', 'json'].includes(options.parser);

  if (obviouslyNotCode) {
    return {
      source,
      storySource: {},
      addsMap: {},
      changed: false,
      dependencies: [],
    };
  }

  const { changed, source: newSource, comments } =
    injectDecorator === true
      ? generateSourceWithDecorators(source, decorator, options.parser)
      : generateSourceWithoutDecorators(source, options.parser);

  const storySource = generateStorySource(extendOptions(source, comments, filepath, options));
  const addsMap = generateAddsMap(storySource, options.parser);
  const dependencies = generateDependencies(storySource, options.parser);

  if (!changed) {
    return {
      source: newSource,
      storySource,
      addsMap: {},
      changed,
      dependencies,
    };
  }

  return {
    source: newSource,
    storySource,
    addsMap,
    changed,
    dependencies,
  };
}

export default inject;
