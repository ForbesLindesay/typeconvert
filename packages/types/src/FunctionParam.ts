import Type from './Type';

export interface FunctionParam {
  name?: string;
  type: Type;
  optional: boolean;
}
export default FunctionParam;
