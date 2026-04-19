/**
 * Pure outcome-decision for PackTheWorker.
 *
 * Given the current placement (ordered list of block ids) and whether the
 * build-load toggle is on, returns exactly one of five outcomes:
 *
 *   oom    -- exceeded the Worker's 128 MB WASM memory ceiling
 *   fatal  -- required data subsystem missing at load time
 *            (uniques missing → PassiveTree.lua:721 nil-call on boot)
 *   stuck  -- calc workspace missing; calc() never returns
 *   silent -- mod tables missing; PoB runs and returns DPS: 48 instead
 *             of the real 5,219,847 (the emotional payoff)
 *   fit    -- UI stripped, everything else present, under capacity
 *
 * OOM supersedes every missing-required check. Among missing-required
 * checks, uniques > calc > mods in priority (matching the order in which
 * PoB itself fails: first assertion hit wins).
 */

import {
  POB_BLOCKS,
  CAPACITY_MB,
  POB_ERRORS,
  SILENT_DPS,
  REAL_DPS,
  type BlockId,
} from './pob-errors';

export type OutcomeKind = 'oom' | 'fatal' | 'stuck' | 'silent' | 'fit';
export type OutcomeBadge = 'overflow' | 'error' | 'silent' | 'fit';

export interface Outcome {
  kind: OutcomeKind;
  text: string;
  badge: OutcomeBadge;
  revealRealAnswer?: { wrong: number; real: number };
}

export interface EvaluateInput {
  placedIds: BlockId[] | string[];
}

export function evaluateConfig(input: EvaluateInput): Outcome {
  const placed = new Set<string>(input.placedIds);
  const total = POB_BLOCKS.filter((b) => placed.has(b.id)).reduce(
    (sum, b) => sum + b.size,
    0,
  );

  if (total > CAPACITY_MB) {
    return {
      kind: 'oom',
      text: POB_ERRORS.OOM(total, CAPACITY_MB),
      badge: 'overflow',
    };
  }

  if (!placed.has('uniques')) {
    return { kind: 'fatal', text: POB_ERRORS.FATAL_UNIQUES, badge: 'error' };
  }
  if (!placed.has('calc')) {
    return { kind: 'stuck', text: POB_ERRORS.STUCK, badge: 'error' };
  }
  if (!placed.has('mods')) {
    return {
      kind: 'silent',
      text: `runs. DPS: ${SILENT_DPS}.`,
      badge: 'silent',
      revealRealAnswer: { wrong: SILENT_DPS, real: REAL_DPS },
    };
  }

  return {
    kind: 'fit',
    text: 'Up and running at 115 MB.',
    badge: 'fit',
  };
}
