import { describe, it, expect } from 'vitest';
import {
  POB_BLOCKS,
  CAPACITY_MB,
  REAL_DPS,
  SILENT_DPS,
  POB_ERRORS,
} from '../../../src/lib/interactives/widgets/pob-errors';

describe('pob-errors constants', () => {
  it('has exactly five memory blocks in the canonical order', () => {
    expect(POB_BLOCKS.map((b) => b.id)).toEqual(['mods', 'uniques', 'ui', 'calc', 'build']);
  });

  it('blocks sum to 163 MB when all placed', () => {
    const total = POB_BLOCKS.reduce((s, b) => s + b.size, 0);
    expect(total).toBe(163);
  });

  it('marks UI and Build as non-required', () => {
    const required = POB_BLOCKS.filter((b) => b.required).map((b) => b.id);
    expect(required).toEqual(['mods', 'uniques', 'calc']);
  });

  it('the build block weighs 22 MB', () => {
    const build = POB_BLOCKS.find((b) => b.id === 'build')!;
    expect(build.size).toBe(22);
  });

  it('has capacity 128 MB', () => {
    expect(CAPACITY_MB).toBe(128);
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
