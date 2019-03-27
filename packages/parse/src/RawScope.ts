import RawDeclaration from './types/Declaration';

export default interface RawScope {
  readonly declarations: {
    [name: string]: ReadonlyArray<RawDeclaration> | undefined;
  };
  readonly parent?: RawScope;
  readonly filename: string;
};
