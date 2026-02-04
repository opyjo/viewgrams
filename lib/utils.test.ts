import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and filters falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });
});
