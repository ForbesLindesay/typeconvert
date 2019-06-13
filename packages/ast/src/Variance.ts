enum Variance {
  /**
   * Bivariant - this is the default
   *
   * Example:
   *
   *     interface Queue<Value> {
   *       push(value: Value): void;
   *       pop(): Value;
   *     }
   *
   * You cannot pass a `Queue<string>` to a function that expects
   * `Queue<'hello' | 'world'>` or visa versa. This is because the
   * function may write a string that is not `'hello' | 'world'`,
   * which fails if you passed `Queue<'hello' | 'world'>` or it could
   * assume it was reading `'hello' | 'world'` which fails when you
   * passed `Queue<string>`.
   *
   * N.B. TypeScript is generally more flexible, and tends to act like
   * most interfaces are Covariant. This can lead to runtime errors,
   * but in practice makes most software development tasks considerably
   * easier.
   */
  ReadWrite = 'ReadWrite',

  /**
   * Covariant
   *
   * Example:
   *
   *     interface QueueReader<+Value> {
   *       pop(): Value;
   *     }
   *
   * You can pass a `QueueReader<'Hello' | 'World'>` to a function that
   * expects `QueueReader<string>`, but not visa versa. This works because
   * every value it reads will be a valid string, even though it can only
   * ever be the string `'hello'` or `'world'`.
   */
  ReadOnly = 'ReadOnly',

  /**
   * Contravariant
   *
   * Example:
   *
   *     interface QueueWriter<-Value> {
   *       push(value: Value): void;
   *     }
   *
   * You can pass a `QueueWriter<string>` to a function that
   * expects `QueueWriter<'Hello' | 'World'>`, but not visa versa.
   * This works because every value it writes will be a valid string,
   * even though it will only ever write the string `'hello'` or
   * `'world'`.
   */
  WriteOnly = 'WriteOnly',
}
export default Variance;
