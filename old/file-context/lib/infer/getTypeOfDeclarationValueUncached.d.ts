import { Declaration, TypeReference } from '@typeconvert/types';
import { InferScopeContext } from './InferContext';
import { DeeperWaitable } from '../utils/Waitable';
export default function getTypeOfDeclarationValueUncached(declaration: DeeperWaitable<Declaration>, ctx: InferScopeContext): DeeperWaitable<TypeReference | null>;
