enum ObjectExactness {
  /**
   * Example:
   *
   *     {|x: number, y: number|}
   *
   * N.B. this may eventually be the default for flow:
   * https://medium.com/flow-type/on-the-roadmap-exact-objects-by-default-16b72933c5cf
   */
  exact = 'exact',
  /**
   * Flow Example:
   *
   *     {x: number, y: number, ...}
   *
   * Once flow becomes exact by default, this will be needed
   * if you wish to specify that an object is inexact.
   */
  inexact = 'inexact',
  /**
   * TypeScript is always exact for the first type an object
   * literal is passed to, but inexact after that. It has no
   * explicit syntax for exact/inexact. We do not record it
   * as exact or inexact.
   *
   * We use this whenever an object in flow hasn't been specified
   * as exact or inexact.
   */
  flexible = 'flexible',
}
export default ObjectExactness;
