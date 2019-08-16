import { File } from '@babel/types';
import { Mode } from '@typeconvert/types';
import WalkResult from './WalkResult';
export default function walk(ast: File, filename: string, src: string, mode: Mode): WalkResult;
