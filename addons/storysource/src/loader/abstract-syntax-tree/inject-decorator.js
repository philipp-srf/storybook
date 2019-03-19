import defaultOptions from './default-options';
import getParser from './parsers';

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
  const parser = getParser(options.parser);
  const ast = parser.parse(source);

  const { changed, source: newSource, comments } =
    injectDecorator === true
      ? generateSourceWithDecorators(source, ast, decorator)
      : generateSourceWithoutDecorators(source, ast);

  const storySource = generateStorySource(extendOptions(source, comments, filepath, options));
  const newAst = parser.parse(storySource);
  const { dependencies, storiesOfIdentifiers } = generateDependencies(newAst);
  const { addsMap, idsToFrameworks } = generateAddsMap(newAst, storiesOfIdentifiers);

  if (!changed) {
    return {
      source: newSource,
      storySource,
      addsMap: {},
      changed,
      dependencies,
      idsToFrameworks: idsToFrameworks || {},
    };
  }

  return {
    source: newSource,
    storySource,
    addsMap,
    changed,
    dependencies,
    idsToFrameworks: idsToFrameworks || {},
  };
}

export default inject;
