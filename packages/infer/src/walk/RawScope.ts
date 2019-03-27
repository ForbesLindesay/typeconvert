import RawDeclaration from './RawDeclaration';

export default interface RawScope {
  readonly declarations: {
    [name: string]: ReadonlyArray<RawDeclaration> | undefined;
  };
  readonly parent?: RawScope;
  readonly filename: string;
};
