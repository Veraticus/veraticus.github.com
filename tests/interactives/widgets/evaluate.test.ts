import { describe, it, expect } from 'vitest';
import { evaluateConfig } from '../../../src/lib/interactives/widgets/evaluate';

describe('evaluateConfig', () => {
  it('empty placed → fatal (uniques required, missing first)', () => {
    const out = evaluateConfig({ placedIds: [] });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('all five placed = 163 MB → oom', () => {
    const out = evaluateConfig({
      placedIds: ['mods', 'uniques', 'ui', 'calc', 'build'],
    });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/163\/128/);
  });

  it('mods + uniques + ui + calc = 141 MB → oom', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'ui', 'calc'] });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/141\/128/);
  });

  it('mods + uniques + calc + build = 137 MB → oom (the impossible configuration)', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'calc', 'build'] });
    expect(out.kind).toBe('oom');
    expect(out.text).toMatch(/137\/128/);
  });

  it('mods + uniques + calc (no UI, no build) = 115 MB → fit', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'calc'] });
    expect(out.kind).toBe('fit');
  });

  it('skip uniques (under capacity) → fatal', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'ui', 'calc'] });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('skip calc (under capacity) → stuck', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'ui'] });
    expect(out.kind).toBe('stuck');
    expect(out.text).toMatch(/workspace/);
  });

  it('skip mods (under capacity) → silent catastrophe with DPS reveal', () => {
    const out = evaluateConfig({ placedIds: ['uniques', 'ui', 'calc'] });
    expect(out.kind).toBe('silent');
    expect(out.text).toMatch(/DPS: 48/);
    expect(out.revealRealAnswer).toEqual({ wrong: 48, real: 5_219_847 });
  });

  it('uniques takes precedence over calc when both required are missing', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'ui'] });
    expect(out.kind).toBe('fatal');
    expect(out.text).toMatch(/buildTreeDependentUniques/);
  });

  it('fit outcome states the running memory footprint', () => {
    const out = evaluateConfig({ placedIds: ['mods', 'uniques', 'calc'] });
    expect(out.text).toMatch(/115 MB/);
  });
});
