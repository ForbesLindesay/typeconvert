const {readdirSync, writeFileSync, statSync, readFileSync} = require('fs');

const LICENSE = readFileSync(__dirname + '/../LICENSE.md');

const tsconfigBuild = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "lib"
  }
}`;
const tsconfig = `{
  "extends": "../../tsconfig.json"
}`;

const dependencies = require('../package.json').dependencies;
readdirSync(__dirname + '/../packages').forEach(directory => {
  if (!statSync(__dirname + '/../packages/' + directory).isDirectory()) {
    return;
  }
  writeFileSync(
    __dirname + '/../packages/' + directory + '/LICENSE.md',
    LICENSE,
  );
  writeFileSync(
    __dirname + '/../packages/' + directory + '/tsconfig.json',
    tsconfig,
  );
  writeFileSync(
    __dirname + '/../packages/' + directory + '/tsconfig.build.json',
    tsconfigBuild,
  );
  let pkg = {};
  try {
    pkg = JSON.parse(
      readFileSync(
        __dirname + '/../packages/' + directory + '/package.json',
        'utf8',
      ),
    );
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
  }
  const before = JSON.stringify(pkg);
  if (!pkg.name) {
    pkg.name = '@typeconvert/' + directory;
  }
  if (!pkg.version) {
    pkg.version = '0.0.0';
  }
  if (!pkg.description) {
    pkg.description = '';
  }
  if (!pkg.main) {
    pkg.main = './lib/index.js';
  }
  if (!pkg.types) {
    pkg.types = './lib/index.d.ts';
  }
  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  pkg.devDependencies['typescript'] = dependencies['typescript'];
  if (!pkg.scripts) {
    pkg.scripts = {};
  }
  if (pkg.dependencies['@types/node']) {
    delete pkg.dependencies['@types/node'];
  }
  Object.keys(pkg.dependencies).forEach(d => {
    if (dependencies[d]) {
      pkg.dependencies[d] = dependencies[d];
    }
  });
  Object.keys(pkg.devDependencies).forEach(d => {
    if (dependencies[d]) {
      pkg.devDependencies[d] = dependencies[d];
    }
  });
  if (!/\-demo$/.test(directory)) {
    pkg.scripts.prepublish =
      'tsc -p tsconfig.build.json && node ../../scripts/prepare ' + directory;
  }

  pkg.repository =
    'https://github.com/ForbesLindesay/typeconvert/tree/master/packages/' +
    directory;
  pkg.license = 'MIT';
  if (!pkg.private) {
    pkg.publishConfig = {
      access: 'public',
    };
  }
  const after = JSON.stringify(pkg);
  if (before === after) {
    return;
  }
  writeFileSync(
    __dirname + '/../packages/' + directory + '/package.json',
    JSON.stringify(pkg, null, '  ') + '\n',
  );
});
