import { expect, it } from 'vitest';
import { formatUsd } from './format';
it('formats dollars', () => expect(formatUsd(725)).toBe('$7.25'));
