export interface IGunHookContext<T> {
  off: () => void;
  to: {
    next: (subject: T) => void;
  };
}
