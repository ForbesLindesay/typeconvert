exports.process = function(src, filename) {
  return `require('${require.resolve('./test.ts')}').default('${filename}');`;
};
