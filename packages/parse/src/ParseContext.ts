import {inspect} from 'util';
import {codeFrameColumns} from '@babel/code-frame';

export default class ParseContext {
  constructor(public readonly src: string) {}
  assertNever(input: never): never {
    return this.throw(input, 'Unexpected Value');
  }
  throw(input: any, message: string): never {
    if (
      input &&
      typeof input === 'object' &&
      input.loc &&
      typeof input.loc === 'object' &&
      input.loc.start &&
      typeof input.loc.start === 'object' &&
      typeof input.loc.start.line === 'number' &&
      (input.loc.start.column === undefined ||
        typeof input.loc.start.column === 'number') &&
      (input.loc.end === undefined ||
        (input.loc.end &&
          typeof input.loc.end === 'object' &&
          typeof input.loc.end.line === 'number' &&
          (input.loc.end.column === undefined ||
            typeof input.loc.end.column === 'number')))
    ) {
      const location: any = {
        start: {line: input.loc.start.line},
      };
      if (typeof input.loc.start.column === 'number') {
        location.start.column = input.loc.start.column + 1;
      }
      if (typeof input.loc.end) {
        location.end = {line: input.loc.end.line};
        if (typeof input.loc.end.column === 'number') {
          location.end.column = input.loc.end.column + 1;
        }
      }
      throw new Error(
        inspect(input, {colors: true}) +
          '\n\n' +
          codeFrameColumns(this.src, location, {
            highlightCode: true,
            message,
          }),
      );
    }
    throw new Error(message + ': ' + inspect(input, {colors: true}));
  }
}
