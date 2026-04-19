/**
 * Verbatim strings + block definitions for the PackTheWorker widget.
 *
 * All error messages and DPS numbers here were captured from real Path of
 * Building runs via the Lua probe scripts. Do not paraphrase -- the
 * authenticity of the failure-state theater is the whole point of the
 * interactive. Changes to these constants are locked down by unit tests.
 */

export type BlockId = 'mods' | 'uniques' | 'ui' | 'calc';
export type BlockColor = 'teal' | 'coral' | 'yellow' | 'purple';

export interface PobBlock {
  id: BlockId;
  label: string;
  size: number;
  color: BlockColor;
  required: boolean;
}

export const POB_BLOCKS: readonly PobBlock[] = [
  { id: 'mods', label: 'Mod tables', size: 41, color: 'teal', required: true },
  { id: 'uniques', label: 'Uniques', size: 46, color: 'coral', required: true },
  { id: 'ui', label: 'UI + class defs', size: 26, color: 'yellow', required: false },
  { id: 'calc', label: 'Calc temps', size: 28, color: 'purple', required: true },
];

export const CAPACITY_MB = 128;
export const BUILD_LOAD_MB = 22;
export const SILENT_DPS = 48;
export const REAL_DPS = 5_219_847;

export const POB_ERRORS = {
  FATAL_UNIQUES:
    "Classes/PassiveTree.lua:721: attempt to call global 'buildTreeDependentUniques' (a nil value)",
  FATAL_TREE: "Classes/PassiveTree.lua:204: attempt to index field 'assets' (a nil value)",
  RARE_UNRECOGNISED: 'Rare DB unrecognised item:',
  STUCK: 'calc() hung: no workspace allocated',
  OOM: (used: number, capacity: number): string =>
    `Worker terminated (memory ${used}/${capacity} MB)`,
} as const;
