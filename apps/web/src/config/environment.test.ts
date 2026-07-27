import { describe, expect, it } from 'vitest';
import { parseAppMode } from './environment';
describe('environment', () => {
  it('defaults safely', () => expect(parseAppMode(undefined)).toBe('demo'));
  it.each(['demo', 'emulator', 'connected'])('accepts %s', (m) =>
    expect(parseAppMode(m)).toBe(m),
  );
  it('rejects invalid', () =>
    expect(() => parseAppMode('production')).toThrow(/Invalid/));
});
