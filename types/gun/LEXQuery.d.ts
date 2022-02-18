import { LEX } from '.';

export type LEXQuery<T extends string = string> = { '.': LEX<T>; ':'?: number };
