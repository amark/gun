export type LEX<T extends string = string> = {
  /** exact match */
  '='?: T;
  /** prefix match */
  '*'?: string;
  /** gte match */
  '>'?: string;
  /** lte match */
  '<'?: string;
  /** 1 for reverse */
  '-'?: number;
};
