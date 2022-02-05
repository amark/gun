import Gun from '../..';

Gun()
  .get('users')
  /* now change the context to alice */
  .get('alice')
  .put({})
  .back()
  .map((x) => x);
