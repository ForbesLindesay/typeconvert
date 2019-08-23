exports.process = function(src, filename) {
  return `require('${require.resolve('./test.ts')}').default('${filename}');`;
};

exports.getCacheKey = function(src, filename) {
  return exports.process(src, filename);
};
