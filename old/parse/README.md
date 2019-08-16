# @typeconvert/parse

## How it works

There are three "phases" to parsing a file into a typeconvert module spec.

### 1. Walk

The raw babel AST is walked, generating a set of "RawDeclaration" statements and a set of exports

Output:

```typescript
interface WalkResult {
  declarations: {
    [name: string]: RawDeclaration[];
  };
  exports: {
    commonJS: BabelExpression[];
    default: (RawDeclaration | BabelExpression)[];
    named: {
      [name: string]: RawDeclaration[];
    };
  };
}
```

### 2. Infer

Starting at the exports, the tree is walked, converting "RawDeclaration" nodes into "DeclarationStatement"s. "DeclarationStatement"s have all necessary type information included, without any need for inference. This also strips out differences between "FunctionDeclaration", "DeclareFunction", "TSDeclareFunction" etc.

Output:

```typescript
interface InferResult {
  declarations: {
    // This may include declarations that are
    // ultimately unused
    [name: string]: Declaration[];
  };
  exports: {
    commonJS: Identifier[];
    default: (Declaration | Identifier)[];
    named: {
      [name: string]: Declaration[];
    };
  };
}
```

### 3. Normalise

Output:

```typescript
interface ParseResult {
  declarations: Declaration[];
  exports: ExportStatement[];
}
```
