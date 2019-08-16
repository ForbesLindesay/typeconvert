import {resolve, relative, dirname} from 'path';
import {mkdirSync, readFileSync, writeFileSync, realpathSync} from 'fs';
import {lsrSync} from 'lsr';
import parse, {Mode} from '../packages/parse/src';
// import spawn = require('cross-spawn');
// import {SourceLocation} from '../packages/types/src';
// import {Mode, ProgramContext} from '../packages/parse/src';
// import print from '../packages/print/src';
// import {SpawnSyncReturns} from 'child_process';

const flowconfig = readFileSync(__dirname + '/../.flowconfig', 'utf8');

// expect.addSnapshotSerializer({
//   print(val: any, serialize, indent) {
//     if (val.constructor.name === 'SourceLocation') {
//       return serialize(
//         new SourceLocation({
//           start: val.start,
//           end: val.end,
//           filename: relative(process.cwd(), val.filename),
//         } as any),
//       );
//     }
//     return serialize({
//       ...val,
//       filename: relative(process.cwd(), val.filename),
//     });
//   },

//   test(val) {
//     return val && typeof val.filename === 'string' && isAbsolute(val.filename);
//   },
// });

// try {
//   mkdirSync(__dirname + '/../output');
// } catch (ex) {
//   if (ex.code !== 'EEXIST') {
//     throw ex;
//   }
// }

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
    describe(entry.path, () => {
      const mode = /\.ts$/.test(filename) ? Mode.TypeScript : Mode.Flow;
      test('parse', () => {
        expect(parse(readFileSync(entry.fullPath, 'utf8'), {
          mode
        })).toMatchSnapshot('ast');
      });
    });
  }
  // let failedTypescript = false;
  // let failedFlow = false;
  // const ctx = new ProgramContext({
  //   mode: /\.ts$/.test(filename) ? Mode.typescript : Mode.flow,
  // });
  // lsrSync(dir, {
  //   filter(entry) {
  //     return entry.name !== '__snapshots__';
  //   },
  // }).forEach(entry => {
  //   if (entry.isDirectory()) {
  //     return;
  //   }
  //   const fullPath = realpathSync(entry.fullPath);
  //   let parseError: any = null;
  //   try {
  //     ctx.parse(entry.fullPath);
  //   } catch (ex) {
  //     parseError = ex;
  //     failedTypescript = true;
  //     failedFlow = true;
  //   }
  //   test('parse ' + entry.path, () => {
  //     if (parseError) {
  //       throw parseError;
  //     }
  //     expect(ctx.parsedFiles[fullPath]).toMatchSnapshot();
  //   });
  // });
  // lsrSync(dir, {
  //   filter(entry) {
  //     return entry.name !== '__snapshots__';
  //   },
  // }).forEach(entry => {
  //   if (entry.isDirectory()) {
  //     try {
  //       mkdirSync(resolve(outputDir, entry.path));
  //     } catch (ex) {
  //       if (ex.code !== 'EEXIST') {
  //         throw ex;
  //       }
  //     }
  //     return;
  //   }
  //   const fullPath = realpathSync(entry.fullPath);
  //   const basepath = entry.path
  //     .replace(/\.d\.ts$/, '')
  //     .replace(/\.ts$/, '')
  //     .replace(/\.js\.flow$/, '')
  //     .replace(/\.js$/, '');
  //   let typescriptOutput: string | undefined;
  //   let flowOutput: string | undefined;
  //   let printTypescriptError: any = null;
  //   let printFlowError: any = null;
  //   try {
  //     typescriptOutput =
  //       ctx.parsedFiles[fullPath] &&
  //       print(fullPath, ctx.parsedFiles, {mode: Mode.typescript});
  //   } catch (ex) {
  //     failedTypescript = true;
  //     printTypescriptError = ex;
  //   }
  //   try {
  //     flowOutput =
  //       ctx.parsedFiles[fullPath] &&
  //       print(fullPath, ctx.parsedFiles, {mode: Mode.flow});
  //   } catch (ex) {
  //     failedFlow = true;
  //     printFlowError = ex;
  //   }
  //   if (!ctx.parsedFiles[fullPath]) {
  //     test('write ' + basepath + '.d.ts');
  //   } else {
  //     test('write ' + basepath + '.d.ts', () => {
  //       if (printTypescriptError) {
  //         throw printTypescriptError;
  //       }
  //       if (typescriptOutput) {
  //         write(resolve(outputDir, basepath + '.d.ts'), typescriptOutput);
  //       }
  //     });
  //   }
  //   if (!ctx.parsedFiles[fullPath]) {
  //     test('write ' + basepath + '.js.flow');
  //   } else {
  //     test('write ' + basepath + '.js.flow', () => {
  //       if (printFlowError) {
  //         throw printFlowError;
  //       }
  //       if (flowOutput) {
  //         write(resolve(outputDir, basepath + '.js.flow'), flowOutput);
  //       }
  //     });
  //   }
  // });
  // let passTypescript = false;
  // let passFlow = false;
  // if (failedTypescript) {
  //   test('typescript');
  // } else {
  //   const result = spawn.sync('tsc', [], {cwd: outputDir});
  //   if (!result.error && result.status === 0) {
  //     passTypescript = true;
  //   }
  //   test('typescript', () => {
  //     if (result.error) {
  //       throw result.error;
  //     }
  //     if (result.status) {
  //       if (result.stdout) {
  //         console.log(result.stdout.toString('utf8'));
  //       }
  //       if (result.stderr) {
  //         console.log(result.stderr.toString('utf8'));
  //       }
  //     }
  //     expect(result.status).toBe(0);
  //   });
  // }
  // if (failedFlow) {
  //   test('flow');
  // } else {
  //   let result: SpawnSyncReturns<Buffer>;
  //   while (true) {
  //     result = spawn.sync('flow', [], {cwd: outputDir});
  //     if (result.status) {
  //       if (/out of retries/i.test(result.stderr.toString('utf8'))) {
  //         spawn.sync('flow', ['stop'], {cwd: outputDir});
  //         continue;
  //       }
  //     }
  //     if (!result.error && result.status === 0) {
  //       passFlow = true;
  //     }
  //     break;
  //   }
  //   test('flow', () => {
  //     if (result.error) {
  //       throw result.error;
  //     }
  //     if (result.status) {
  //       if (result.stdout) {
  //         console.log(result.stdout.toString('utf8'));
  //       }
  //       if (result.stderr) {
  //         console.log(result.stderr.toString('utf8'));
  //       }
  //     }
  //     expect(result.status).toBe(0);
  //   });
  // }
  // lsrSync(dir, {
  //   filter(entry) {
  //     return entry.name !== '__snapshots__';
  //   },
  // }).forEach(entry => {
  //   if (entry.isDirectory()) {
  //     return;
  //   }
  //   const basepath = entry.path
  //     .replace(/\.d\.ts$/, '')
  //     .replace(/\.ts$/, '')
  //     .replace(/\.js\.flow$/, '')
  //     .replace(/\.js$/, '');
  //   if (passTypescript) {
  //     test('print ' + basepath + '.d.ts', () => {
  //       if (passTypescript) {
  //         expect(
  //           readFileSync(resolve(outputDir, basepath + '.d.ts'), 'utf8'),
  //         ).toMatchSnapshot();
  //       }
  //     });
  //   } else {
  //     test('print ' + basepath + '.d.ts');
  //   }
  //   if (passFlow) {
  //     test('print ' + basepath + '.js.flow', () => {
  //       if (passFlow) {
  //         expect(
  //           readFileSync(resolve(outputDir, basepath + '.js.flow'), 'utf8'),
  //         ).toMatchSnapshot();
  //       }
  //     });
  //   } else {
  //     test('print ' + basepath + '.js.flow');
  //   }
  // });
};
