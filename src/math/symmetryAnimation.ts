/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export const SYMMETRY_AXIS_EPSILON = 1e-3;
export const SYMMETRY_ANIMATION_DURATION_MS = 3600;

/**
 * Smooth cubic ease-in-out on [0, 1].
 */
export function easeInOutCubic(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

/**
 * Returns true when t = b/a is already effectively on the symmetry axis t = 1.
 */
export function isAtSymmetryAxis(t: number, eps = SYMMETRY_AXIS_EPSILON): boolean {
  if (!Number.isFinite(t) || t <= 0) return false;
  return Math.abs(Math.log(t)) <= eps;
}

/**
 * Evaluates a smooth symmetric round-trip trajectory t(progress) in logarithmic space:
 *   u = ln(t), u_start = ln(t_start), u_end = -u_start = ln(1 / t_start)
 *
 * Schedule over progress in [0, 1]:
 *   - [0.00, 0.42]: smooth eased transition t_start -> 1 / t_start (passing through t = 1)
 *   - [0.42, 0.58]: clean hold at reciprocal 1 / t_start to highlight Ka <-> Kb swap
 *   - [0.58, 1.00]: smooth eased return 1 / t_start -> t_start (passing back through t = 1)
 *
 * Edge cases:
 *   - t_start at t = 1 returns exact 1 with zero movement and no NaN/Infinity.
 *   - Non-finite or non-positive t_start safely returns 1.
 */
export function evaluateSymmetryTrajectoryT(tStart: number, progress: number): number {
  if (!Number.isFinite(tStart) || tStart <= 0) {
    return 1;
  }
  if (isAtSymmetryAxis(tStart)) {
    return 1;
  }

  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const uStart = Math.log(tStart);
  const uEnd = -uStart;

  const FORWARD_END = 0.42;
  const HOLD_END = 0.58;

  let u: number;
  if (p <= FORWARD_END) {
    const s = easeInOutCubic(p / FORWARD_END);
    u = uStart + s * (uEnd - uStart);
  } else if (p < HOLD_END) {
    u = uEnd;
  } else {
    const s = easeInOutCubic((p - HOLD_END) / (1 - HOLD_END));
    u = uEnd + s * (uStart - uEnd);
  }

  return Math.exp(u);
}
