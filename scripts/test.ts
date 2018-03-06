import {resolve, relative, isAbsolute, dirname} from 'path';
import {mkdirSync, readFileSync, writeFileSync} from 'fs';
import {lsrSync} from 'lsr';
import spawn = require('cross-spawn');
import {Module, SourceLocation} from '../packages/types/src';
import parse, {Mode} from '../packages/parse/src';
import print from '../packages/print/src';

const flowconfig = readFileSync(__dirname + '/../.flowconfig', 'utf8');

expect.addSnapshotSerializer({
  print(val, serialize, indent) {
    return serialize(
      new SourceLocation({
        start: val.start,
        end: val.end,
        filename: relative(process.cwd(), val.filename),
      } as any),
    );
  },

  test(val) {
    return val && typeof val.filename === 'string' && isAbsolute(val.filename);
  },
});

try {
  mkdirSync(__dirname + '/../output');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

function write(filename: string, src: string) {
  try {
    if (src === readFileSync(filename, 'utf8')) {
      return;
    }
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
  }
  writeFileSync(filename, src);
}
export default (filename: string) => {
  const dir = dirname(filename);
  const relativeDir = relative(__dirname + '/../test-cases', dir);
  const outputDir = resolve(__dirname + '/../output', relativeDir);
  try {
    mkdirSync(outputDir);
  } catch (ex) {
    if (ex.code !== 'EEXIST') {
      throw ex;
    }
  }
  write(resolve(outputDir, '.flowconfig'), flowconfig);
  write(
    resolve(outputDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'es2016',
          module: 'commonjs',
          strict: true,
          noImplicitAny: true,
          noImplicitThis: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          preserveConstEnums: true,
          jsx: 'preserve',
          lib: ['es2016', 'dom'],
          noEmit: true,
        },
      },
      null,
      '  ',
    ) + '\n',
  );
  lsrSync(dir, {
    filter(entry) {
      return entry.name !== '__snapshots__';
    },
  }).forEach(entry => {
    if (entry.isDirectory()) {
      try {
        mkdirSync(resolve(outputDir, entry.path));
      } catch (ex) {
        if (ex.code !== 'EEXIST') {
          throw ex;
        }
      }
      return;
    }
    let ast: Module | undefined;
    test('parse ' + entry.path, () => {
      ast = parse(
        entry.fullPath,
        /\.ts$/.test(entry.path) ? Mode.typescript : Mode.flow,
      );
      expect(ast).toMatchSnapshot();
    });
    const basepath = entry.path
      .replace(/\.d\.ts$/, '')
      .replace(/\.ts$/, '')
      .replace(/\.js\.flow$/, '')
      .replace(/\.js$/, '');
    test('write ' + basepath + '.d.ts', () => {
      if (ast) {
        write(
          resolve(outputDir, basepath + '.d.ts'),
          print(ast, Mode.typescript),
        );
      }
    });
    test('write ' + basepath + '.js.flow', () => {
      if (ast) {
        write(resolve(outputDir, basepath + '.js.flow'), print(ast, Mode.flow));
      }
    });
  });
  let passFlow = false,
    passTypescript = false;
  test('typescript', () => {
    const result = spawn.sync('tsc', [], {cwd: outputDir});
    if (result.error) {
      throw result.error;
    }
    if (result.status) {
      if (result.stdout) {
        console.log(result.stdout.toString('utf8'));
      }
      if (result.stderr) {
        console.log(result.stderr.toString('utf8'));
      }
    }
    expect(result.status).toBe(0);
    passTypescript = true;
  });
  test('flow', () => {
    while (true) {
      const result = spawn.sync('flow', [], {cwd: outputDir});
      if (result.error) {
        throw result.error;
      }
      if (result.status) {
        if (/out of retries/i.test(result.stderr.toString('utf8'))) {
          spawn.sync('flow', ['stop'], {cwd: outputDir});
          continue;
        }
        if (result.stdout) {
          console.log(result.stdout.toString('utf8'));
        }
        if (result.stderr) {
          console.log(result.stderr.toString('utf8'));
        }
      }
      expect(result.status).toBe(0);
      passFlow = true;
      return;
    }
  });
  lsrSync(dir, {
    filter(entry) {
      return entry.name !== '__snapshots__';
    },
  }).forEach(entry => {
    if (entry.isDirectory()) {
      return;
    }
    const basepath = entry.path
      .replace(/\.d\.ts$/, '')
      .replace(/\.ts$/, '')
      .replace(/\.js\.flow$/, '')
      .replace(/\.js$/, '');
    test('print ' + basepath + '.d.ts', () => {
      if (passTypescript) {
        expect(
          readFileSync(resolve(outputDir, basepath + '.d.ts'), 'utf8'),
        ).toMatchSnapshot();
      }
    });
    test('print ' + basepath + '.js.flow', () => {
      if (passFlow) {
        expect(
          readFileSync(resolve(outputDir, basepath + '.js.flow'), 'utf8'),
        ).toMatchSnapshot();
      }
    });
  });
};
