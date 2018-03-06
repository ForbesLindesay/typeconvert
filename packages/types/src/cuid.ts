import cuidRaw = require('cuid');

// prettier-ignore
export declare const cuidSymbol: unique symbol;
export type CUID = string & typeof cuidSymbol;

export function cuid(): CUID {
  return cuidRaw() as CUID;
}
export default CUID;
