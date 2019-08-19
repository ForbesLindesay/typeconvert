import ImportSource from '../aliases/ImportSource';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Identifier from './Identifier';

/**
 * Example:
 *
 *     import foo from 'foo';
 *     import {bar} from 'foo';
 *     import {bar as bing} from 'foo';
 *
 * @alias ImportSource
 */
export interface EsImportSource extends NodeBase {
  readonly kind: NodeKind.EsImportSource;
  readonly relativePath: string;
  /**
   * The exported name, may be "default"
   */
  readonly id: Identifier;
}
/**
 * Example:
 *
 *     import foo = require('foo');
 *
 * @alias ImportSource
 */
export interface CommonJSImportSource extends NodeBase {
  readonly kind: NodeKind.CommonJSImportSource;
  readonly relativePath: string;
}
/**
 * Example:
 *
 *     import * as foo from 'foo';
 *
 * @alias ImportSource
 */
export interface NamespaceImportSource extends NodeBase {
  readonly kind: NodeKind.NamespaceImportSource;
  readonly relativePath: string;
}
/**
 * Example:
 *
 *     import foo from 'bar';
 *     import {foo} from 'bar';
 *     import foo = require('bar');
 *
 * @alias Statement
 * @alias Declaration
 */
export default interface ImportStatement extends NodeBase {
  readonly kind: NodeKind.ImportStatement;
  readonly source: ImportSource;
  /**
   * local name
   */
  readonly id: Identifier;
  readonly mode: 'type' | 'typeof' | 'value' | undefined;
}
