/**
 * Created by Paul on 9/8/2016.
 */

export default { // some reserved key words, these are not the only ones.
  meta: '_' // all metadata of the node is stored in the meta property on the node.
  , soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
  , field: '.' // a field is a property on a node which points to a value.
  , state: '>' // other than the soul, we store HAM metadata.
  , '#': 'soul'
  , '.': 'field'
  , '=': 'value'
  , '>': 'state'
};
