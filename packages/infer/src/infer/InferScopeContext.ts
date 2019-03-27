import * as bt from '@babel/types';
import {TypeReference} from '@typeconvert/types';
import FileContext from '../FileContext';
import {DeepWaitable} from '../utils/Waitable';
import {InferProgramContext} from './InferContext';
import WalkResult from '../walk/WalkResult';

export class InferScopeContext extends FileContext {
  public readonly programContext: InferProgramContext;
  public readonly walkResult: WalkResult;

  constructor(walkResult: WalkResult, programContext: InferProgramContext) {
    super(walkResult.filename, walkResult.src, programContext.mode);
    this.programContext = programContext;
    this.walkResult = walkResult;
  }

  getTypeOfBabelType(
    babelType: bt.FlowType | bt.TSType,
  ): DeepWaitable<TypeReference> {
    return this.programContext.getTypeOfBabelType(babelType, this);
  }
}
