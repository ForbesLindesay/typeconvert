/**
 * @autogenerated
 */

import AnyTypeAnnotation from './nodes/AnyTypeAnnotation';
import ArrayExpression from './nodes/ArrayExpresison';
import ArrayTypeAnnotation from './nodes/ArrayTypeAnnotation';
import AssignmentExpression from './nodes/AssignmentExpression';
import BooleanTypeAnnotation from './nodes/BooleanTypeAnnotation';
import EmptyTypeAnnotation from './nodes/EmptyTypeAnnotation';
import ExistsTypeAnnotation from './nodes/ExistsTypeAnnotation';
import ExportDefault from './nodes/ExportDefault';
import ExportNamed from './nodes/ExportNamed';
import ExpressionStatement from './nodes/ExpressionStatement';
import File from './nodes/File';
import FunctionParameter from './nodes/FunctionParameter';
import FunctionTypeAnnotation from './nodes/FunctionTypeAnnotation';
import Identifier from './nodes/Identifier';
import ImportTypeAnnotation from './nodes/ImportTypeAnnotation';
import InferTypeAnnotation from './nodes/InferTypeAnnotation';
import IntersectionTypeAnnotation from './nodes/IntersectionTypeAnnotation';
import LiteralTypeAnnotation from './nodes/LiteralTypeAnnotation';
import NumberTypeAnnotation from './nodes/NumberTypeAnnotation';
import {ObjectTypeProperty} from './nodes/ObjectTypeAnnotation';
import {ObjectTypeIndexer} from './nodes/ObjectTypeAnnotation';
import {ObjectTypeSpreadProperty} from './nodes/ObjectTypeAnnotation';
import ObjectTypeAnnotation from './nodes/ObjectTypeAnnotation';
import QualifiedTypeIdentifier from './nodes/QualifiedTypeIdentifier';
import SpreadElement from './nodes/SpreadElement';
import StringTypeAnnotation from './nodes/StringTypeAnnotation';
import SymbolTypeAnnotation from './nodes/SymbolTypeAnnotation';
import ThisTypeAnnotation from './nodes/ThisTypeAnnotation';
import TupleTypeAnnotation from './nodes/TupleTypeAnnotation';
import TypeAliasDeclaration from './nodes/TypeAliasDeclaration';
import TypeParameter from './nodes/TypeParameter';
import TypeReferenceAnnotation from './nodes/TypeReferenceAnnotation';
import TypeofTypeAnnotation from './nodes/TypeofTypeAnnotation';
import UnionTypeAnnotation from './nodes/UnionTypeAnnotation';
import UnknownTypeAnnotation from './nodes/UnknownTypeAnnotation';
import Node from './aliases/Node';
import TypeAnnotation from './aliases/TypeAnnotation';
import Expression from './aliases/Expression';
import Statement from './aliases/Statement';
import LVal from './aliases/LVal';
import ObjectTypeElement from './aliases/ObjectTypeElement';
import Declaration from './aliases/Declaration';
import TypeDeclaration from './aliases/TypeDeclaration';
import Comment, {CommentKind} from './Comment';
import NodeBase from './NodeBase';
import NodeKind from './NodeKind';
import SourceLocation from './SourceLocation';
import Variance from './Variance';

export {AnyTypeAnnotation};
export {ArrayExpression};
export {ArrayTypeAnnotation};
export {AssignmentExpression};
export {BooleanTypeAnnotation};
export {EmptyTypeAnnotation};
export {ExistsTypeAnnotation};
export {ExportDefault};
export {ExportNamed};
export {ExpressionStatement};
export {File};
export {FunctionParameter};
export {FunctionTypeAnnotation};
export {Identifier};
export {ImportTypeAnnotation};
export {InferTypeAnnotation};
export {IntersectionTypeAnnotation};
export {LiteralTypeAnnotation};
export {NumberTypeAnnotation};
export {ObjectTypeProperty};
export {ObjectTypeIndexer};
export {ObjectTypeSpreadProperty};
export {ObjectTypeAnnotation};
export {QualifiedTypeIdentifier};
export {SpreadElement};
export {StringTypeAnnotation};
export {SymbolTypeAnnotation};
export {ThisTypeAnnotation};
export {TupleTypeAnnotation};
export {TypeAliasDeclaration};
export {TypeParameter};
export {TypeReferenceAnnotation};
export {TypeofTypeAnnotation};
export {UnionTypeAnnotation};
export {UnknownTypeAnnotation};
export {Node};
export {TypeAnnotation};
export {Expression};
export {Statement};
export {LVal};
export {ObjectTypeElement};
export {Declaration};
export {TypeDeclaration};
export {Comment, CommentKind}
export {NodeBase};
export {NodeKind};
export {SourceLocation};
export {Variance};

export function createAnyTypeAnnotation(props: Omit<AnyTypeAnnotation, 'kind'>): AnyTypeAnnotation {
  return {...props, kind: NodeKind.AnyTypeAnnotation};
}
export function createArrayExpression(props: Omit<ArrayExpression, 'kind'>): ArrayExpression {
  return {...props, kind: NodeKind.ArrayExpression};
}
export function createArrayTypeAnnotation(props: Omit<ArrayTypeAnnotation, 'kind'>): ArrayTypeAnnotation {
  return {...props, kind: NodeKind.ArrayTypeAnnotation};
}
export function createAssignmentExpression(props: Omit<AssignmentExpression, 'kind'>): AssignmentExpression {
  return {...props, kind: NodeKind.AssignmentExpression};
}
export function createBooleanTypeAnnotation(props: Omit<BooleanTypeAnnotation, 'kind'>): BooleanTypeAnnotation {
  return {...props, kind: NodeKind.BooleanTypeAnnotation};
}
export function createEmptyTypeAnnotation(props: Omit<EmptyTypeAnnotation, 'kind'>): EmptyTypeAnnotation {
  return {...props, kind: NodeKind.EmptyTypeAnnotation};
}
export function createExistsTypeAnnotation(props: Omit<ExistsTypeAnnotation, 'kind'>): ExistsTypeAnnotation {
  return {...props, kind: NodeKind.ExistsTypeAnnotation};
}
export function createExportDefault(props: Omit<ExportDefault, 'kind'>): ExportDefault {
  return {...props, kind: NodeKind.ExportDefault};
}
export function createExportNamed(props: Omit<ExportNamed, 'kind'>): ExportNamed {
  return {...props, kind: NodeKind.ExportNamed};
}
export function createExpressionStatement(props: Omit<ExpressionStatement, 'kind'>): ExpressionStatement {
  return {...props, kind: NodeKind.ExpressionStatement};
}
export function createFile(props: Omit<File, 'kind'>): File {
  return {...props, kind: NodeKind.File};
}
export function createFunctionParameter(props: Omit<FunctionParameter, 'kind'>): FunctionParameter {
  return {...props, kind: NodeKind.FunctionParameter};
}
export function createFunctionTypeAnnotation(props: Omit<FunctionTypeAnnotation, 'kind'>): FunctionTypeAnnotation {
  return {...props, kind: NodeKind.FunctionTypeAnnotation};
}
export function createIdentifier(props: Omit<Identifier, 'kind'>): Identifier {
  return {...props, kind: NodeKind.Identifier};
}
export function createImportTypeAnnotation(props: Omit<ImportTypeAnnotation, 'kind'>): ImportTypeAnnotation {
  return {...props, kind: NodeKind.ImportTypeAnnotation};
}
export function createInferTypeAnnotation(props: Omit<InferTypeAnnotation, 'kind'>): InferTypeAnnotation {
  return {...props, kind: NodeKind.InferTypeAnnotation};
}
export function createIntersectionTypeAnnotation(props: Omit<IntersectionTypeAnnotation, 'kind'>): IntersectionTypeAnnotation {
  return {...props, kind: NodeKind.IntersectionTypeAnnotation};
}
export function createLiteralTypeAnnotation(props: Omit<LiteralTypeAnnotation, 'kind'>): LiteralTypeAnnotation {
  return {...props, kind: NodeKind.LiteralTypeAnnotation};
}
export function createNumberTypeAnnotation(props: Omit<NumberTypeAnnotation, 'kind'>): NumberTypeAnnotation {
  return {...props, kind: NodeKind.NumberTypeAnnotation};
}
export function createObjectTypeProperty(props: Omit<ObjectTypeProperty, 'kind'>): ObjectTypeProperty {
  return {...props, kind: NodeKind.ObjectTypeProperty};
}
export function createObjectTypeIndexer(props: Omit<ObjectTypeIndexer, 'kind'>): ObjectTypeIndexer {
  return {...props, kind: NodeKind.ObjectTypeIndexer};
}
export function createObjectTypeSpreadProperty(props: Omit<ObjectTypeSpreadProperty, 'kind'>): ObjectTypeSpreadProperty {
  return {...props, kind: NodeKind.ObjectTypeSpreadProperty};
}
export function createObjectTypeAnnotation(props: Omit<ObjectTypeAnnotation, 'kind'>): ObjectTypeAnnotation {
  return {...props, kind: NodeKind.ObjectTypeAnnotation};
}
export function createQualifiedTypeIdentifier(props: Omit<QualifiedTypeIdentifier, 'kind'>): QualifiedTypeIdentifier {
  return {...props, kind: NodeKind.QualifiedTypeIdentifier};
}
export function createSpreadElement(props: Omit<SpreadElement, 'kind'>): SpreadElement {
  return {...props, kind: NodeKind.SpreadElement};
}
export function createStringTypeAnnotation(props: Omit<StringTypeAnnotation, 'kind'>): StringTypeAnnotation {
  return {...props, kind: NodeKind.StringTypeAnnotation};
}
export function createSymbolTypeAnnotation(props: Omit<SymbolTypeAnnotation, 'kind'>): SymbolTypeAnnotation {
  return {...props, kind: NodeKind.SymbolTypeAnnotation};
}
export function createThisTypeAnnotation(props: Omit<ThisTypeAnnotation, 'kind'>): ThisTypeAnnotation {
  return {...props, kind: NodeKind.ThisTypeAnnotation};
}
export function createTupleTypeAnnotation(props: Omit<TupleTypeAnnotation, 'kind'>): TupleTypeAnnotation {
  return {...props, kind: NodeKind.TupleTypeAnnotation};
}
export function createTypeAliasDeclaration(props: Omit<TypeAliasDeclaration, 'kind'>): TypeAliasDeclaration {
  return {...props, kind: NodeKind.TypeAliasDeclaration};
}
export function createTypeParameter(props: Omit<TypeParameter, 'kind'>): TypeParameter {
  return {...props, kind: NodeKind.TypeParameter};
}
export function createTypeReferenceAnnotation(props: Omit<TypeReferenceAnnotation, 'kind'>): TypeReferenceAnnotation {
  return {...props, kind: NodeKind.TypeReferenceAnnotation};
}
export function createTypeofTypeAnnotation(props: Omit<TypeofTypeAnnotation, 'kind'>): TypeofTypeAnnotation {
  return {...props, kind: NodeKind.TypeofTypeAnnotation};
}
export function createUnionTypeAnnotation(props: Omit<UnionTypeAnnotation, 'kind'>): UnionTypeAnnotation {
  return {...props, kind: NodeKind.UnionTypeAnnotation};
}
export function createUnknownTypeAnnotation(props: Omit<UnknownTypeAnnotation, 'kind'>): UnknownTypeAnnotation {
  return {...props, kind: NodeKind.UnknownTypeAnnotation};
}

export function isAnyTypeAnnotation(node: Node): node is AnyTypeAnnotation {
  return node.kind === NodeKind.AnyTypeAnnotation;
}
export function isArrayExpression(node: Node): node is ArrayExpression {
  return node.kind === NodeKind.ArrayExpression;
}
export function isArrayTypeAnnotation(node: Node): node is ArrayTypeAnnotation {
  return node.kind === NodeKind.ArrayTypeAnnotation;
}
export function isAssignmentExpression(node: Node): node is AssignmentExpression {
  return node.kind === NodeKind.AssignmentExpression;
}
export function isBooleanTypeAnnotation(node: Node): node is BooleanTypeAnnotation {
  return node.kind === NodeKind.BooleanTypeAnnotation;
}
export function isEmptyTypeAnnotation(node: Node): node is EmptyTypeAnnotation {
  return node.kind === NodeKind.EmptyTypeAnnotation;
}
export function isExistsTypeAnnotation(node: Node): node is ExistsTypeAnnotation {
  return node.kind === NodeKind.ExistsTypeAnnotation;
}
export function isExportDefault(node: Node): node is ExportDefault {
  return node.kind === NodeKind.ExportDefault;
}
export function isExportNamed(node: Node): node is ExportNamed {
  return node.kind === NodeKind.ExportNamed;
}
export function isExpressionStatement(node: Node): node is ExpressionStatement {
  return node.kind === NodeKind.ExpressionStatement;
}
export function isFile(node: Node): node is File {
  return node.kind === NodeKind.File;
}
export function isFunctionParameter(node: Node): node is FunctionParameter {
  return node.kind === NodeKind.FunctionParameter;
}
export function isFunctionTypeAnnotation(node: Node): node is FunctionTypeAnnotation {
  return node.kind === NodeKind.FunctionTypeAnnotation;
}
export function isIdentifier(node: Node): node is Identifier {
  return node.kind === NodeKind.Identifier;
}
export function isImportTypeAnnotation(node: Node): node is ImportTypeAnnotation {
  return node.kind === NodeKind.ImportTypeAnnotation;
}
export function isInferTypeAnnotation(node: Node): node is InferTypeAnnotation {
  return node.kind === NodeKind.InferTypeAnnotation;
}
export function isIntersectionTypeAnnotation(node: Node): node is IntersectionTypeAnnotation {
  return node.kind === NodeKind.IntersectionTypeAnnotation;
}
export function isLiteralTypeAnnotation(node: Node): node is LiteralTypeAnnotation {
  return node.kind === NodeKind.LiteralTypeAnnotation;
}
export function isNumberTypeAnnotation(node: Node): node is NumberTypeAnnotation {
  return node.kind === NodeKind.NumberTypeAnnotation;
}
export function isObjectTypeProperty(node: Node): node is ObjectTypeProperty {
  return node.kind === NodeKind.ObjectTypeProperty;
}
export function isObjectTypeIndexer(node: Node): node is ObjectTypeIndexer {
  return node.kind === NodeKind.ObjectTypeIndexer;
}
export function isObjectTypeSpreadProperty(node: Node): node is ObjectTypeSpreadProperty {
  return node.kind === NodeKind.ObjectTypeSpreadProperty;
}
export function isObjectTypeAnnotation(node: Node): node is ObjectTypeAnnotation {
  return node.kind === NodeKind.ObjectTypeAnnotation;
}
export function isQualifiedTypeIdentifier(node: Node): node is QualifiedTypeIdentifier {
  return node.kind === NodeKind.QualifiedTypeIdentifier;
}
export function isSpreadElement(node: Node): node is SpreadElement {
  return node.kind === NodeKind.SpreadElement;
}
export function isStringTypeAnnotation(node: Node): node is StringTypeAnnotation {
  return node.kind === NodeKind.StringTypeAnnotation;
}
export function isSymbolTypeAnnotation(node: Node): node is SymbolTypeAnnotation {
  return node.kind === NodeKind.SymbolTypeAnnotation;
}
export function isThisTypeAnnotation(node: Node): node is ThisTypeAnnotation {
  return node.kind === NodeKind.ThisTypeAnnotation;
}
export function isTupleTypeAnnotation(node: Node): node is TupleTypeAnnotation {
  return node.kind === NodeKind.TupleTypeAnnotation;
}
export function isTypeAliasDeclaration(node: Node): node is TypeAliasDeclaration {
  return node.kind === NodeKind.TypeAliasDeclaration;
}
export function isTypeParameter(node: Node): node is TypeParameter {
  return node.kind === NodeKind.TypeParameter;
}
export function isTypeReferenceAnnotation(node: Node): node is TypeReferenceAnnotation {
  return node.kind === NodeKind.TypeReferenceAnnotation;
}
export function isTypeofTypeAnnotation(node: Node): node is TypeofTypeAnnotation {
  return node.kind === NodeKind.TypeofTypeAnnotation;
}
export function isUnionTypeAnnotation(node: Node): node is UnionTypeAnnotation {
  return node.kind === NodeKind.UnionTypeAnnotation;
}
export function isUnknownTypeAnnotation(node: Node): node is UnknownTypeAnnotation {
  return node.kind === NodeKind.UnknownTypeAnnotation;
}
export function isNode(node: Node): node is Node {
  return (node.kind === NodeKind.AnyTypeAnnotation || node.kind === NodeKind.ArrayExpression || node.kind === NodeKind.ArrayTypeAnnotation || node.kind === NodeKind.AssignmentExpression || node.kind === NodeKind.BooleanTypeAnnotation || node.kind === NodeKind.EmptyTypeAnnotation || node.kind === NodeKind.ExistsTypeAnnotation || node.kind === NodeKind.ExportDefault || node.kind === NodeKind.ExportNamed || node.kind === NodeKind.ExpressionStatement || node.kind === NodeKind.File || node.kind === NodeKind.FunctionParameter || node.kind === NodeKind.FunctionTypeAnnotation || node.kind === NodeKind.Identifier || node.kind === NodeKind.ImportTypeAnnotation || node.kind === NodeKind.InferTypeAnnotation || node.kind === NodeKind.IntersectionTypeAnnotation || node.kind === NodeKind.LiteralTypeAnnotation || node.kind === NodeKind.NumberTypeAnnotation || node.kind === NodeKind.ObjectTypeAnnotation || node.kind === NodeKind.ObjectTypeIndexer || node.kind === NodeKind.ObjectTypeProperty || node.kind === NodeKind.ObjectTypeSpreadProperty || node.kind === NodeKind.QualifiedTypeIdentifier || node.kind === NodeKind.SpreadElement || node.kind === NodeKind.StringTypeAnnotation || node.kind === NodeKind.SymbolTypeAnnotation || node.kind === NodeKind.ThisTypeAnnotation || node.kind === NodeKind.TupleTypeAnnotation || node.kind === NodeKind.TypeAliasDeclaration || node.kind === NodeKind.TypeParameter || node.kind === NodeKind.TypeReferenceAnnotation || node.kind === NodeKind.TypeofTypeAnnotation || node.kind === NodeKind.UnionTypeAnnotation || node.kind === NodeKind.UnknownTypeAnnotation);
}
export function isTypeAnnotation(node: Node): node is TypeAnnotation {
  return (node.kind === NodeKind.AnyTypeAnnotation || node.kind === NodeKind.ArrayTypeAnnotation || node.kind === NodeKind.BooleanTypeAnnotation || node.kind === NodeKind.EmptyTypeAnnotation || node.kind === NodeKind.ExistsTypeAnnotation || node.kind === NodeKind.FunctionTypeAnnotation || node.kind === NodeKind.ImportTypeAnnotation || node.kind === NodeKind.InferTypeAnnotation || node.kind === NodeKind.IntersectionTypeAnnotation || node.kind === NodeKind.LiteralTypeAnnotation || node.kind === NodeKind.NumberTypeAnnotation || node.kind === NodeKind.ObjectTypeAnnotation || node.kind === NodeKind.StringTypeAnnotation || node.kind === NodeKind.SymbolTypeAnnotation || node.kind === NodeKind.ThisTypeAnnotation || node.kind === NodeKind.TupleTypeAnnotation || node.kind === NodeKind.TypeReferenceAnnotation || node.kind === NodeKind.TypeofTypeAnnotation || node.kind === NodeKind.UnionTypeAnnotation || node.kind === NodeKind.UnknownTypeAnnotation);
}
export function isExpression(node: Node): node is Expression {
  return (node.kind === NodeKind.ArrayExpression || node.kind === NodeKind.AssignmentExpression || node.kind === NodeKind.Identifier);
}
export function isStatement(node: Node): node is Statement {
  return (node.kind === NodeKind.ExportDefault || node.kind === NodeKind.ExportNamed || node.kind === NodeKind.ExpressionStatement || node.kind === NodeKind.TypeAliasDeclaration);
}
export function isLVal(node: Node): node is LVal {
  return (node.kind === NodeKind.Identifier);
}
export function isObjectTypeElement(node: Node): node is ObjectTypeElement {
  return (node.kind === NodeKind.ObjectTypeIndexer || node.kind === NodeKind.ObjectTypeProperty || node.kind === NodeKind.ObjectTypeSpreadProperty);
}
export function isDeclaration(node: Node): node is Declaration {
  return (node.kind === NodeKind.TypeAliasDeclaration);
}
export function isTypeDeclaration(node: Node): node is TypeDeclaration {
  return (node.kind === NodeKind.TypeAliasDeclaration);
}