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
   */
  WriteOnly = 'WriteOnly',
}
export default Variance;
