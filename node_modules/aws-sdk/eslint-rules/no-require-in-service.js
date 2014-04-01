module.exports = function(context) {
  return {
    CallExpression: function(node) {
      if (!context.getFilename().match(/^lib\/services\//)) return;
      if (node.callee.name === 'require' && node.arguments[0].value !== '../core') {
        context.report(node, 'require() is disallowed in service files');
      }
    }
  };
};
