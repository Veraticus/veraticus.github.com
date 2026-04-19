import { describe, it, expect } from 'vitest';
import {
  POB_BLOCKS,
  CAPACITY_MB,
  BUILD_LOAD_MB,
  REAL_DPS,
  SILENT_DPS,
  POB_ERRORS,
} from '../../../src/lib/interactives/widgets/pob-errors';

describe('pob-errors constants', () => {
  it('has exactly four memory blocks in the canonical order', () => {
    expect(POB_BLOCKS.map((b) => b.id)).toEqual(['mods', 'uniques', 'ui', 'calc']);
  });

  it('blocks sum to 141 MB when all placed', () => {
    const total = POB_BLOCKS.reduce((s, b) => s + b.size, 0);
    expect(total).toBe(141);
  });

  it('marks exactly the UI block as non-required', () => {
    const required = POB_BLOCKS.filter((b) => b.required).map((b) => b.id);
    expect(required).toEqual(['mods', 'uniques', 'calc']);
  });

  it('has capacity 128 MB and build load 22 MB', () => {
    expect(CAPACITY_MB).toBe(128);
    expect(BUILD_LOAD_MB).toBe(22);
  });

  it('pins the real-vs-silent DPS numbers', () => {
    expect(SILENT_DPS).toBe(48);
    expect(REAL_DPS).toBe(5_219_847);
  });

  it('preserves verbatim fatal-uniques error string from the Lua probe', () => {
    expect(POB_ERRORS.FATAL_UNIQUES).toBe(
      "Classes/PassiveTree.lua:721: attempt to call global 'buildTreeDependentUniques' (a nil value)",
    );
  });

  it('preserves verbatim fatal-tree error string', () => {
    expect(POB_ERRORS.FATAL_TREE).toBe(
      "Classes/PassiveTree.lua:204: attempt to index field 'assets' (a nil value)",
    );
  });

  it('preserves the rare-unrecognised prefix the probe emitted', () => {
    expect(POB_ERRORS.RARE_UNRECOGNISED).toBe('Rare DB unrecognised item:');
  });

  it('formats the OOM message with used and capacity', () => {
    expect(POB_ERRORS.OOM(141, 128)).toBe('Worker terminated (memory 141/128 MB)');
  });

  it('stuck message mentions the missing workspace', () => {
    expect(POB_ERRORS.STUCK).toBe('calc() hung: no workspace allocated');
  });
});
