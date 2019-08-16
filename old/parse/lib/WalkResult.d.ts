import { Expression as BabelExpression, ReturnStatement, ExportSpecifier } from '@babel/types';
import RawDeclaration from './types/Declaration';
import RawScopedValue from './RawScopedValue';
export default interface WalkResult {
    readonly filename: string;
    readonly src: string;
    readonly exports: {
        readonly commonJS: ReadonlyArray<RawScopedValue<BabelExpression>>;
        readonly default: ReadonlyArray<RawScopedValue<RawDeclaration | BabelExpression>>;
        readonly named: {
            readonly [name: string]: ReadonlyArray<RawScopedValue<RawDeclaration | ExportSpecifier>> | undefined;
        };
    };
    readonly returns: ReadonlyArray<RawScopedValue<ReturnStatement>>;
}
