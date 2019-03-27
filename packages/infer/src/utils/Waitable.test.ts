import {readFileSync} from 'fs';
import {Mode} from '@typeconvert/types';
import Waitable from './Waitable';
import FileContext from '../FileContext';

test('Waitable.resolveDeep - circular', () => {
  const x = new Waitable(() => 10);
  const y: any = {x};
  y.y = y;
  const z = new Waitable(() => y);
  const expected: any = {x: 10};
  expected.y = expected;
  expect(Waitable.resolveDeep(z)).toEqual(expected);
});

test('Waitable.resolveDeep - types', () => {
  const x = new Waitable(() => 10);
  const y = {x};
  const z = new Waitable(() => y);
  const expected = {x: 10};
  const result: {x: number} = Waitable.resolveDeep(z);
  expect(result).toEqual(expected);
});

test('waitable.getValue() -> cyclic dependency error', () => {
  const x = new Waitable(
    (): number => y.getValue(),
    {
      start: {
        line: 1,
        column: 0,
      },

      end: {
        line: 1,
        column: 10,
      },
    },
    new FileContext(
      __filename,
      readFileSync(__filename, 'utf8'),
      Mode.typescript,
    ),
  );
  const y = new Waitable(
    (): number => z.getValue(),
    {
      start: {
        line: 2,
        column: 0,
      },

      end: {
        line: 2,
        column: 10,
      },
    },
    new FileContext(
      __filename,
      readFileSync(__filename, 'utf8'),
      Mode.typescript,
    ),
  );
  const z = new Waitable(
    (): number => x.getValue(),
    {
      start: {
        line: 3,
        column: 0,
      },

      end: {
        line: 3,
        column: 10,
      },
    },
    new FileContext(
      __filename,
      readFileSync(__filename, 'utf8'),
      Mode.typescript,
    ),
  );
  const a = new Waitable(
    (): number => x.getValue(),
    {
      start: {
        line: 42,
        column: 0,
      },

      end: {
        line: 42,
        column: 10,
      },
    },
    new FileContext(
      __filename,
      readFileSync(__filename, 'utf8'),
      Mode.typescript,
    ),
  );
  Waitable.highlightCodeInErrors = false;
  expect(() => a.getValue()).toThrowErrorMatchingSnapshot();
  expect(() => a.getValue()).toThrowErrorMatchingSnapshot();
  Waitable.highlightCodeInErrors = true;
});
