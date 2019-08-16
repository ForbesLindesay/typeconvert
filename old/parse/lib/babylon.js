"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const { parse } = require('babylon');
function parseSource(src, options) {
    return parse(src, {
        allowImportExportEverywhere: options.allowImportExportEverywhere,
        allowReturnOutsideFunction: options.allowReturnOutsideFunction,
        allowSuperOutsideMethod: options.allowSuperOutsideMethod,
        sourceType: options.sourceType || 'module',
        sourceFilename: options.filename,
        plugins: [
            'jsx',
            options.mode === types_1.Mode.flow ? 'flow' : 'typescript',
            'doExpressions',
            'objectRestSpread',
            'classProperties',
            'classPrivateProperties',
            'classPrivateMethods',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'asyncGenerators',
            'functionBind',
            'dynamicImport',
            'numericSeparator',
            'optionalChaining',
            'bigInt',
            'optionalCatchBinding',
            'throwExpressions',
            'pipelineOperator',
            'nullishCoalescingOperator',
        ],
    });
}
exports.default = parseSource;
//# sourceMappingURL=babylon.js.map