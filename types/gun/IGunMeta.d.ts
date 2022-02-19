export interface IGunMeta<T extends object> {
  _: {
    '#': string;
    '>': {
      [key in keyof T]: number;
    };
  };
}
