import { Node } from '@babel/types';
import Comment from './types/Comment';
import FileContext from '@typeconvert/file-context/src';
export { Comment };
export default function getComments(node: Node, ctx: FileContext): Comment[];
