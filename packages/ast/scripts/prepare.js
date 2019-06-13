const {resolve} = require('path');
const {readdirSync, readFileSync, writeFileSync} = require('fs');
const parser = require('@babel/parser');

const NodeLocations = new Map();
const Aliases = new Map();

readdirSync(__dirname + '/../src/nodes').forEach(fn => {
  const filename = resolve(__dirname + '/../src/nodes', fn);
  if (!/.*\.ts$/.test(filename)) return;
  const src = readFileSync(filename, 'utf8');
  const ast = parser.parse(src, {
    sourceType: 'module',
    sourceFilename: filename,
    plugins: [
      'jsx',
      'typescript',
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
      'nullishCoalescingOperator',
    ],
  });
  ast.program.body.forEach(s =>
    walkStatement(s, s.leadingComments || [], null),
  );
  function walkStatement(statement, leadingComments, parentType) {
    switch (statement.type) {
      case 'ExportDefaultDeclaration':
      case 'ExportNamedDeclaration':
        walkStatement(
          statement.declaration,
          [
            ...leadingComments,
            ...(statement.declaration.leadingComments || []),
          ],
          statement.type,
        );
        break;
      case 'TSInterfaceDeclaration': {
        if (!parentType) {
          // ignore interfaces that are not exported
          return;
        }
        const name = `${statement.id.name}`;
        if (NodeLocations.has(name)) {
          throw new Error(
            `Duplicate interface ${name} declared in ${fn} and ${
              NodeLocations.get(name).file
            }`,
          );
        }
        NodeLocations.set(name, {
          file: fn,
          mode: parentType === 'ExportNamedDeclaration' ? 'name' : 'default',
        });
        const extendsNodeBase = (statement.extends || []).some(
          ex => ex.expression && ex.expression.name === 'NodeBase',
        );
        if (extendsNodeBase) {
          if (!Aliases.has('Node')) {
            Aliases.set('Node', []);
          }
          Aliases.get('Node').push(name);
        } else {
          console.warn('NOT A NODE: ' + name);
        }
        leadingComments.forEach(comment => {
          comment.value.replace(/\@alias ([^\n]+)/g, (_, aliasName) => {
            if (!Aliases.has(aliasName)) {
              Aliases.set(aliasName, []);
            }
            Aliases.get(aliasName).push(name);
          });
        });
        break;
      }
    }
  }
});

// console.log(Aliases);
Aliases.forEach((membersSet, aliasName) => {
  const members = [...membersSet].sort();
  writeFileSync(
    __dirname + `/../src/aliases/${aliasName}.ts`,
    [
      '/**',
      ' * @autogenerated',
      ' */',
      '',
      ...members.map(m => {
        const location = NodeLocations.get(m);
        return `import ${
          location.mode === 'default' ? `${m}` : `{${m}}`
        } from '../nodes/${location.file.replace(/\.ts$/, '')}';`;
      }),
      '',
      `type ${aliasName} = `,
      ...members.map(
        (m, i) => `  | ${m}` + (i === members.length - 1 ? ';' : ''),
      ),
      '',
      `export default ${aliasName};`,
      '',
    ].join('\n'),
  );
});
