import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';

export default function extractDeclaredIdentifiers(
  input: ast.Pattern,
  ctx: ParseContext,
): ast.Identifier[] {
  switch (input.kind) {
    case ast.NodeKind.Identifier:
      return [input];
    case ast.NodeKind.ArrayPattern:
      return input.elements
        .map(el => extractDeclaredIdentifiers(el, ctx))
        .reduce((a, b) => [...a, ...b], [])
        .concat(
          input.restElement
            ? extractDeclaredIdentifiers(input.restElement, ctx)
            : [],
        );
    case ast.NodeKind.AssignmentPattern:
      return extractDeclaredIdentifiers(input.left, ctx);
    case ast.NodeKind.ObjectPattern:
      return input.elements
        .map(el => extractDeclaredIdentifiers(el.value, ctx))
        .reduce((a, b) => [...a, ...b], [])
        .concat(
          input.restElement
            ? extractDeclaredIdentifiers(input.restElement, ctx)
            : [],
        );
    default:
      return ctx.assertNever(input);
  }
}
