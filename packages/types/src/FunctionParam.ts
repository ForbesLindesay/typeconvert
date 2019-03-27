import TypeReference from './TypeReference';

export interface FunctionParam {
  name?: string;
  type: TypeReference;
  optional: boolean;
}
export default FunctionParam;
