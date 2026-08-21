import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, formatBRL, timeAgo } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toContain('base');
    expect(result).toContain('extra');
    expect(result).not.toContain('hidden');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatBRL', () => {
  it('formats cents to BRL', () => {
    expect(formatBRL(1999)).toContain('19,99');
    expect(formatBRL(100)).toContain('1,00');
  });

  it('handles zero', () => {
    const result = formatBRL(0);
    expect(result).toContain('0,00');
  });

  it('handles large values', () => {
    const result = formatBRL(999999);
    expect(result).toContain('9.999,99');
  });

  it('handles negative values', () => {
    const result = formatBRL(-500);
    expect(result).toContain('5,00');
    expect(result).toMatch(/-/);
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "agora" for less than 1 minute', () => {
    expect(timeAgo(new Date('2026-08-20T11:59:30'))).toBe('agora');
  });

  it('returns minutes for < 1 hour', () => {
    expect(timeAgo(new Date('2026-08-20T11:55:00'))).toBe('há 5 min');
  });

  it('returns hours for < 24 hours', () => {
    expect(timeAgo(new Date('2026-08-20T09:00:00'))).toBe('há 3h');
  });

  it('returns days for >= 24 hours', () => {
    expect(timeAgo(new Date('2026-08-18T12:00:00'))).toBe('há 2d');
  });

  it('handles string input', () => {
    expect(timeAgo('2026-08-20T11:50:00')).toBe('há 10 min');
  });
});
