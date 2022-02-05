export interface IGunMeta<T extends Record<string, any>> {
  _: {
    '#': string;
    '>': {
      [key in keyof T]: number;
    };
  };
}
