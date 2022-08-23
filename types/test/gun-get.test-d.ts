import Gun from '../..';

new Gun<{ a: { b: number; c: number } }>().get('a').get('b');

new Gun().get<{ b: number; c: number }>('a').get('b');
