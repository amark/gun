var Gun = typeof window !== 'undefined' ? window.Gun : require('../gun');

const rel_ = Gun.val.link._; // '#'
const node_ = Gun.node._; // '_'

Gun.chain.unset = function (node) {
  if (this && node) {
    if (
      node[node_] &&
      node[node_].put &&
      node[node_].put[node_] &&
      node[node_].put[node_][rel_]
    ) {
      this.put({[node[node_].put[node_][rel_]]: null});
    } else if (node[node_] && node[node_][rel_]) {
      this.put({[node[node_][rel_]]: null});
    }
    return this;
  }
};
