import { describe, expect, it } from "vitest";
import {
  CASCADE,
  DURATIONS,
  EASINGS,
  GEOMETRY,
  SPRINGS,
  THEMES,
  Z,
} from "@/config/tokens";

describe("token exports (SPEC §5–§8 smoke)", () => {
  it("exports motion durations from spec", () => {
    expect(DURATIONS.flip).toBe(180);
    expect(DURATIONS.snap).toBe(220);
    expect(DURATIONS.dealCard).toBe(300);
    expect(DURATIONS.dealStagger).toBe(45);
    expect(DURATIONS.invalidShake).toBe(320);
    expect(DURATIONS.cascadeTimeout).toBe(12_000);
  });

  it("exports easing curves from spec §8.1", () => {
    expect(EASINGS.standard).toEqual([0.2, 0.8, 0.2, 1]);
    expect(EASINGS.decel).toEqual([0.16, 1, 0.3, 1]);
    expect(EASINGS.accel).toEqual([0.4, 0, 1, 1]);
  });

  it("exports Motion spring configs from spec §8.1", () => {
    expect(SPRINGS.snap).toEqual({ stiffness: 520, damping: 30, mass: 0.9 });
    expect(SPRINGS.soft).toEqual({ stiffness: 300, damping: 26, mass: 1 });
  });

  it("exports card geometry ratios from spec §6", () => {
    expect(GEOMETRY.aspect).toBeCloseTo(5 / 7);
    expect(GEOMETRY.cardWidthMax).toBe(104);
    expect(GEOMETRY.cardWidthMin).toBe(40);
    expect(GEOMETRY.overlapFaceupRatio).toBe(0.24);
    expect(GEOMETRY.overlapFacedownRatio).toBe(0.11);
    expect(GEOMETRY.wasteFanRatio).toBe(0.26);
  });

  it("exports cascade physics from spec §8.6", () => {
    expect(CASCADE.gravity).toBe(2100);
    expect(CASCADE.vxMin).toBe(-560);
    expect(CASCADE.vxMax).toBe(560);
    expect(CASCADE.vyMin).toBe(-580);
    expect(CASCADE.vyMax).toBe(-200);
    expect(CASCADE.floorRestitution).toBe(0.93);
    expect(CASCADE.wallRestitution).toBe(0.85);
  });

  it("exports z-index layers from spec §7", () => {
    expect(Z.cardBase).toBe(10);
    expect(Z.cardDragging).toBe(1000);
    expect(Z.cascade).toBe(2000);
    expect(Z.modal).toBe(3000);
    expect(Z.toast).toBe(3500);
  });

  it("lists all three launch themes", () => {
    expect(THEMES).toEqual(["heritage", "midnight", "studio"]);
  });
});
