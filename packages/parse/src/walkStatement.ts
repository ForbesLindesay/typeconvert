import * as bt from '@babel/types';
import {Mode} from '@typeconvert/types';
import WalkContext from './WalkContext';
import Declaration, {DeclarationKind} from './types/Declaration';
import {ImportSetKind} from './types/DeclarationTypes/ImportDeclaration';
import getComments, {Comment} from './getComments';
import normalizeTypeAnnotation from './normalizeTypeAnnotation';

export default function walkStatement(
  statement: bt.Statement,
  ctx: WalkContext,
): void {
  switch (statement.type) {
    case 'BlockStatement':
      statement.body.forEach(statement =>
        walkStatement(statement, ctx.getBlockContext()),
      );
      break;
    case 'DoWhileStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'ForStatement':
    case 'LabeledStatement':
    case 'WhileStatement':
    case 'WithStatement':
      walkStatement(statement.body, ctx);
      break;
    case 'BreakStatement':
    case 'ContinueStatement':
    case 'DebuggerStatement':
    case 'EmptyStatement':
    case 'ThrowStatement':
      break;
    case 'ExpressionStatement': {
      const expression = statement.expression;
      switch (expression.type) {
        case 'AssignmentExpression':
          if (
            expression.operator === '=' &&
            bt.isMemberExpression(expression.left, {computed: false}) &&
            bt.isIdentifier(expression.left.property, {name: 'exports'}) &&
            bt.isIdentifier(expression.left.object, {name: 'module'})
          ) {
            if (ctx.mode === Mode.flow) {
              ctx.addCommonJSExport(expression.right);
            }
          }
          break;
      }
      break;
    }
    case 'TSExportAssignment':
      ctx.addCommonJSExport(statement.expression);
      break;
    case 'TSImportEqualsDeclaration':
      if (
        bt.isTSQualifiedName(statement.moduleReference) ||
        bt.isIdentifier(statement.moduleReference)
      ) {
        throw ctx.getError(
          'Expected TSExternalModuleReference but got ' +
            statement.moduleReference.type,
          statement.moduleReference,
        );
      }
      ctx.addDeclaration(statement.id, {
        kind: DeclarationKind.ImportDeclaration,
        leadingComments: getComments(statement, ctx),
        set: {kind: ImportSetKind.ImportCommonJS},
        localName: statement.id.name,
        loc: statement.loc,
        relativePath: statement.moduleReference.expression.value,
      });
      break;
    case 'TSNamespaceExportDeclaration':
      throw ctx.getError(
        'Unsupported node type "TSNamespaceExportDeclaration"',
        statement,
      );
    case 'IfStatement':
      walkStatement(statement.consequent, ctx);
      if (statement.alternate) {
        walkStatement(statement.alternate, ctx);
      }
      break;
    case 'ReturnStatement':
      ctx.addReturn(statement);
      break;
    case 'SwitchStatement':
      statement.cases.forEach(c => {
        c.consequent.forEach(statement => walkStatement(statement, ctx));
      });
      break;
    case 'TryStatement':
      walkStatement(statement.block, ctx);
      if (statement.handler) {
        walkStatement(statement.handler.body, ctx);
      }
      if (statement.finalizer) {
        walkStatement(statement.finalizer, ctx);
      }
      break;
    case 'DeclareClass':
    case 'DeclareExportDeclaration':
    case 'DeclareExportAllDeclaration':
    case 'DeclareFunction':
    case 'DeclareInterface':
    case 'DeclareModule':
    case 'DeclareModuleExports':
    case 'DeclareOpaqueType':
    case 'DeclareTypeAlias':
    case 'DeclareVariable':
    case 'ClassDeclaration':
    case 'ExportNamedDeclaration':
    case 'FunctionDeclaration':
    case 'ImportDeclaration':
    case 'InterfaceDeclaration':
    case 'VariableDeclaration':
    case 'ExportAllDeclaration':
    case 'ExportDefaultDeclaration':
    case 'InterfaceDeclaration':
    case 'OpaqueType':
    case 'TSDeclareFunction':
    case 'TSEnumDeclaration':
    case 'TSInterfaceDeclaration':
    case 'TSModuleDeclaration':
    case 'TSTypeAliasDeclaration':
    case 'TypeAlias':
      walkDeclaration(statement, ctx);
      break;
    default:
      return ctx.assertNever('Unsupported statement kind', statement);
  }
}

function walkDeclaration(
  declaration: bt.Declaration,
  ctx: WalkContext,
): Declaration[] {
  switch (declaration.type) {
    case 'DeclareExportDeclaration':
    case 'DeclareExportAllDeclaration':
    case 'DeclareModule':
    case 'DeclareModuleExports':
    case 'TSModuleDeclaration':
      throw ctx.getError(
        'Unsupported declaration ' + declaration.type,
        declaration,
      );
    case 'DeclareClass':
    case 'DeclareFunction':
    case 'DeclareInterface':
    case 'DeclareOpaqueType':
    case 'DeclareTypeAlias':
    case 'TypeAlias':
    case 'InterfaceDeclaration':
    case 'OpaqueType':
    case 'TSEnumDeclaration':
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
    case 'ClassDeclaration':
    case 'FunctionDeclaration':
    case 'TSDeclareFunction':
      if (declaration.id) {
        ctx.addDeclaration(declaration.id, declaration);
      }
      return [declaration];
    case 'DeclareVariable':
      return [
        ctx.addDeclaration(declaration.id, {
          kind: DeclarationKind.LocalDeclaration,
          leadingComments: getComments(declaration, ctx),
          localName: declaration.id.name,
          loc: declaration.loc,
          valueType: normalizeTypeAnnotation(
            declaration.id.typeAnnotation,
            ctx,
          ),
        }),
      ];
    case 'VariableDeclaration':
      return walkVariableDeclaration(declaration, ctx);
    case 'ExportNamedDeclaration': {
      if (declaration.declaration) {
        declaration.declaration.leadingComments = (
          declaration.leadingComments || []
        ).concat(declaration.declaration.leadingComments || []);
        const declarations = walkDeclaration(declaration.declaration, ctx);
        declarations.forEach(declaration => {
          ctx.addNamedExport(declaration);
        });
      }
      declaration.specifiers.forEach((specifier): void => {
        switch (specifier.type) {
          case 'ExportDefaultSpecifier':
          case 'ExportNamespaceSpecifier':
            throw ctx.getError(
              'Unsupported specifier type: ExportDefaultSpecifier',
              specifier,
            );
          case 'ExportSpecifier':
            ctx.addNamedExport(specifier);
            break;
          default:
            return specifier;
        }
      });
      return [];
    }
    case 'ExportAllDeclaration':
      ctx.addExportAll(declaration);
      return [];
    case 'ExportDefaultDeclaration': {
      const arg = declaration.declaration;
      // TODO: improve typescript definitions to add `isDeclaration(n): n is Declaration
      if (bt.isDeclaration(arg)) {
        const d = arg as bt.Declaration;
        d.leadingComments = (declaration.leadingComments || []).concat(
          d.leadingComments || [],
        );
        const rawDeclarations = walkDeclaration(d, ctx);
        rawDeclarations.forEach(declaration => {
          ctx.addDefaultExport(declaration);
        });
        return rawDeclarations;
      } else {
        const e = arg as bt.Expression;
        e.leadingComments = (declaration.leadingComments || []).concat(
          e.leadingComments || [],
        );
        ctx.addDefaultExport(e);
        return [];
      }
    }
    case 'ImportDeclaration':
      return walkImportDeclaration(declaration, ctx);
    default:
      return declaration;
  }
}
function walkVariableDeclaration(
  node: bt.VariableDeclaration,
  ctx: WalkContext,
): Declaration[] {
  const result: Declaration[] = [];
  function recurse(
    id: bt.LVal,
    init: bt.Expression | undefined,
    typeAnnotation: bt.TypeAnnotation | bt.TSTypeAnnotation | undefined,
    leadingComments: ReadonlyArray<Comment>,
  ): void {
    switch (id.type) {
      case 'Identifier':
        result.push(
          ctx.addDeclaration(id, {
            kind: DeclarationKind.LocalDeclaration,
            valueInit: init,
            valueType: normalizeTypeAnnotation(
              id.typeAnnotation || typeAnnotation,
              ctx,
            ),
            leadingComments,
            localName: id.name,
            loc: id.loc,
          }),
        );
        //   result.push(

        //     ctx.addDeclaration(id, {
        //       type: DeclarationKind.VariableDeclaration,
        //       mode,
        //       leadingComments,
        //       localName: id.name,
        //       loc: id.loc,
        //       init,
        //       typeAnnotation: normalize(id.typeAnnotation || typeAnnotation),
        //     }),
        //   );
        break;
      case 'RestElement':
        recurse(
          id.argument,
          init,
          typeAnnotation,
          leadingComments.concat(getComments(id, ctx)),
        );
        break;
      case 'MemberExpression':
      case 'TSParameterProperty':
        throw ctx.getError(
          id.type + ' is not supported as the type for a variable identifier',
          id,
        );
      case 'AssignmentPattern':
        recurse(
          id.left,
          init
            ? bt.conditionalExpression(
                bt.binaryExpression('===', init, bt.identifier('undefined')),
                id.right,
                init,
              )
            : id.right,
          typeAnnotation,
          leadingComments,
        );
        break;
      case 'ArrayPattern':
        (id.elements as any[]).forEach((element: bt.LVal, index) => {
          if (!bt.isLVal(element)) {
            throw ctx.getError('Expected LVal', element);
          }
          if (element.type === 'RestElement') {
            recurse(
              element,
              init,
              typeAnnotation,
              leadingComments.concat(getComments(element, ctx)),
            );
          } else {
            recurse(
              element,
              init
                ? bt.memberExpression(init, bt.numericLiteral(index), true)
                : undefined,
              typeAnnotation ? indexIntoType(typeAnnotation, index) : undefined,
              leadingComments.concat(getComments(element, ctx)),
            );
          }
        });
        break;
      case 'ObjectPattern':
        id.properties.forEach((prop): void => {
          switch (prop.type) {
            case 'ObjectProperty':
              if (!bt.isIdentifier(prop.key)) {
                throw ctx.getError(
                  'Expected Identifier but got ' + prop.key.type,
                  prop.key,
                );
              }
              recurse(
                // TODO: enfore LValness
                (prop.value as bt.LVal) || prop.key,
                init
                  ? bt.memberExpression(
                      init,
                      bt.stringLiteral(prop.key.name),
                      true,
                    )
                  : undefined,
                typeAnnotation
                  ? indexIntoType(typeAnnotation, prop.key.name)
                  : undefined,

                leadingComments.concat(getComments(prop, ctx)),
              );
              break;
            case 'RestElement':
              // TODO: We are igonring the properties that are being removed here
              recurse(prop.argument, init, typeAnnotation, leadingComments);
              break;
            default:
              return prop;
          }
        });
        break;
      default:
        return id;
    }
  }
  node.declarations.forEach(declaration => {
    const ta = (declaration.id as any).typeAnnotation;
    recurse(
      declaration.id,
      normalize(declaration.init),
      bt.isTypeAnnotation(ta) ? ta : undefined,
      getComments(node, ctx).concat(getComments(declaration, ctx)),
    );
  });
  return result;
}

function indexIntoType(
  type: bt.TypeAnnotation | bt.TSTypeAnnotation,
  property: string | number,
) {
  if (bt.isTSTypeAnnotation(type)) {
    return bt.tsTypeAnnotation(
      bt.tsIndexedAccessType(
        type.typeAnnotation,
        bt.tsLiteralType(
          typeof property === 'number'
            ? bt.numericLiteral(property)
            : bt.stringLiteral(property),
        ),
      ),
    );
  } else {
    return bt.typeAnnotation(
      bt.genericTypeAnnotation(
        bt.identifier('$PropertyType'),
        bt.typeParameterInstantiation([
          type.typeAnnotation,
          typeof property === 'number'
            ? bt.numberLiteralTypeAnnotation(property)
            : bt.stringLiteralTypeAnnotation(property),
        ]),
      ),
    );
  }
}

function walkImportDeclaration(
  declaration: bt.ImportDeclaration,
  ctx: WalkContext,
): Declaration[] {
  return declaration.specifiers.map((specifier): Declaration => {
    const leadingComments = (declaration.leadingComments || []).concat(
      specifier.leadingComments || [],
    );
    switch (specifier.type) {
      case 'ImportSpecifier':
        return ctx.addDeclaration(specifier.local, {
          type: DeclarationKind.ImportNamed,
          importName: specifier.imported.name,
          relativePath: declaration.source.value,
          leadingComments,
          localName: specifier.local.name,
          loc: specifier.loc,
        });
      case 'ImportDefaultSpecifier':
        return ctx.addDeclaration(specifier.local, {
          type: DeclarationKind.ImportDefault,
          relativePath: declaration.source.value,
          leadingComments,
          localName: specifier.local.name,
          loc: specifier.loc,
        });
      case 'ImportNamespaceSpecifier':
        return ctx.addDeclaration(specifier.local, {
          type: DeclarationKind.ImportNamespace,
          relativePath: declaration.source.value,
          leadingComments,
          localName: specifier.local.name,
          loc: specifier.loc,
        });
      default:
        return ctx.assertNever(
          'Unsupported import declatration kind',
          specifier,
        );
    }
  });
}
