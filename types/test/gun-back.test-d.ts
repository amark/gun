import Gun from '../..';

new Gun<{ a: { b: number; c: number } }>()
  .get('a')
  .get('b')
  .back()
  .get('c')
  .once((c) => c.toFixed(2));

new Gun()
  .get<{ b: number; c: number }>('a')
  .get('b')
  .back()
  .get('c')
  .once((c) => c.toFixed(2));

new Gun()
  .get('a')
  .back<{ a: number; b: number }>()
  .get('b')
  .once((b) => b.toFixed(2));

new Gun()
  .get('a')
  .get('b')
  .back<{ a: number; c: number }>(-2)
  .get('c')
  .once((c) => c.toFixed(2));
