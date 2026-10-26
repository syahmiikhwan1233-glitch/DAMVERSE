/**
 * DAMVERSE - Procedural Terrain Elevation & Surface Sampling
 * Mathematical heightmap providing seamless grounding for actors, roads, and canyon walls.
 */

export interface SurfaceSample {
  height: number;
  isWater: boolean;
  isRoad: boolean;
  isDamCrest: boolean;
  isPowerhouse: boolean;
}

/**
 * Samples ground elevation at world coordinates (x, z).
 */
export function sampleElevation(x: number, z: number): number {
  const distFromCenter = Math.abs(x);

  // 1. Dam Structure & Crest Road (Z between -4 and +4, X between -55 and +55)
  if (Math.abs(z) <= 3.5 && distFromCenter <= 52) {
    return 30.0; // Crest road level
  }

  // 2. Powerhouse and Switchyard Platform (Z between -45 and -15, X between -45 and 45)
  if (z >= -45 && z <= -15 && Math.abs(x) <= 45) {
    return 4.0;
  }

  // 3. Mountain gorge walls flanking the dam (X < -50 or X > 50 near Z=0)
  const mountainRamp = Math.max(0, distFromCenter - 45);
  const mountainBase = Math.min(65, Math.pow(mountainRamp * 0.85, 1.25) + 8);

  // 4. Upstream Reservoir Basin (Z > 0)
  if (z > 0) {
    // Basin floor drops down to Y=6.0m
    const canyonValley = 6.0 + Math.pow(distFromCenter / 12, 1.8);
    const mountainSide = Math.min(80, canyonValley + Math.sin(x * 0.05) * 5 + Math.cos(z * 0.04) * 8);
    return Math.max(canyonValley, mountainSide * 0.5);
  }

  // 5. Downstream Valley & Riverbed (Z < 0)
  // River canyon runs along X near 0 from Z= -45 to -320
  const riverMeander = Math.sin(z * 0.02) * 15;
  const distFromRiver = Math.abs(x - riverMeander);

  // Road ramp down from Dam (X=48, Z=0 at Y=30) down to Valley Floor (Y=2.0)
  // Serpentine switchback road
  const isRoadSegment =
    (z < 0 && z > -70 && Math.abs(x - (48 + z * 0.35)) < 4.0) ||
    (z <= -70 && z > -140 && Math.abs(x - (25 + Math.sin(z * 0.05) * 12)) < 4.5);

  if (isRoadSegment) {
    // Road slope from 30 down to 3
    const progress = Math.min(1, Math.max(0, -z / 140));
    return 30.0 * (1 - progress) + 3.0 * progress;
  }

  // River trench
  if (distFromRiver < 18) {
    const riverBed = 1.0 + Math.pow(distFromRiver / 18, 2) * 2.5;
    return riverBed;
  }

  // City plain on the west bank (X < -35, Z between -140 and -290)
  if (x < -35 && x > -160 && z < -130 && z > -290) {
    return 3.5 + Math.sin(x * 0.02) * 0.5; // Flat city building pad
  }

  // Industrial plain on east bank (X > 45, Z between -190 and -310)
  if (x > 45 && x < 150 && z < -180 && z > -310) {
    return 3.2; // Flat industrial pad
  }

  // Surrounding hilly terrain
  const hills = 3.0 + Math.pow(distFromRiver / 20, 1.4) * 4.0 + Math.sin(x * 0.04 + z * 0.03) * 6.0;
  return Math.min(85, hills);
}

/**
 * Returns full surface sample at (x, z).
 */
export function getSurfaceSample(x: number, z: number, waterLevel: number): SurfaceSample {
  const height = sampleElevation(x, z);
  const isDamCrest = Math.abs(z) <= 3.5 && Math.abs(x) <= 52;
  const isPowerhouse = z >= -45 && z <= -15 && Math.abs(x) <= 45;
  const isWater = z > 0 ? height < waterLevel : height < 3.2;
  const isRoad = isDamCrest || (z < 0 && z > -150 && Math.abs(x - 30) < 15);

  return {
    height,
    isWater,
    isRoad,
    isDamCrest,
    isPowerhouse,
  };
}
