import { IPolicy } from '.';

export type Policy = string | IPolicy | (string | IPolicy)[];
