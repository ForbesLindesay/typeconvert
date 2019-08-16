import { SourceLocation } from '@typeconvert/file-context';
export default interface TypeAnnotationBase {
    readonly loc: SourceLocation | null;
}
