import { Declaration, TypeReference } from '@typeconvert/types';
import { InferScopeContext } from './InferContext';
import { DeeperWaitable } from '../utils/Waitable';
export default function getTypeFromDeclarationUncached(declaration: DeeperWaitable<Declaration>, ctx: InferScopeContext): DeeperWaitable<TypeReference | null>;
