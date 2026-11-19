export type Point2 = { x: number; y: number };
export type FilledPolygon = { outer: Point2[]; holes: Point2[][] };
export type Footprint = ReturnType<typeof makeFootprint>;

export function makeFootprint(polygons: FilledPolygon[]) {
  const points = polygons.flatMap(polygon => polygon.outer);
  return {
    polygons,
    rings: polygons.flatMap(polygon => [polygon.outer, ...polygon.holes]),
    minX: Math.min(...points.map(point => point.x)),
    maxX: Math.max(...points.map(point => point.x)),
    minY: Math.min(...points.map(point => point.y)),
    maxY: Math.max(...points.map(point => point.y))
  };
}

const epsilon = 1e-7;
const cross = (a: Point2, b: Point2, c: Point2) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const onSegment = (point: Point2, a: Point2, b: Point2) =>
  Math.abs(cross(a, b, point)) <= epsilon &&
  point.x >= Math.min(a.x, b.x) - epsilon && point.x <= Math.max(a.x, b.x) + epsilon &&
  point.y >= Math.min(a.y, b.y) - epsilon && point.y <= Math.max(a.y, b.y) + epsilon;

function pointSegmentDistanceSquared(point: Point2, start: Point2, end: Point2) {
  const dx = end.x - start.x, dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  const projection = length ? ((point.x - start.x) * dx + (point.y - start.y) * dy) / length : 0;
  const t = Math.max(0, Math.min(1, projection));
  return (point.x - start.x - t * dx) ** 2 + (point.y - start.y - t * dy) ** 2;
}

function edgesTouch(a: Point2, b: Point2, c: Point2, d: Point2, clearance: number) {
  if (Math.max(a.x, b.x) < Math.min(c.x, d.x) - clearance || Math.max(c.x, d.x) < Math.min(a.x, b.x) - clearance ||
      Math.max(a.y, b.y) < Math.min(c.y, d.y) - clearance || Math.max(c.y, d.y) < Math.min(a.y, b.y) - clearance) return false;
  const abc = cross(a, b, c), abd = cross(a, b, d), cda = cross(c, d, a), cdb = cross(c, d, b);
  if (abc * abd < 0 && cda * cdb < 0) return true;
  if (onSegment(c, a, b) || onSegment(d, a, b) || onSegment(a, c, d) || onSegment(b, c, d)) return true;
  const limit = clearance * clearance;
  return pointSegmentDistanceSquared(a, c, d) < limit || pointSegmentDistanceSquared(b, c, d) < limit ||
    pointSegmentDistanceSquared(c, a, b) < limit || pointSegmentDistanceSquared(d, a, b) < limit;
}

function inRing(point: Point2, ring: Point2[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

const contains = (footprint: Footprint, point: Point2) => footprint.polygons.some(polygon =>
  inRing(point, polygon.outer) && !polygon.holes.some(hole => inRing(point, hole))
);

/** Test the filled outlines, including counters, rather than their rectangles. */
export function footprintsTouch(a: Footprint, b: Footprint, clearance = epsilon) {
  if (a.maxX < b.minX - clearance || b.maxX < a.minX - clearance || a.maxY < b.minY - clearance || b.maxY < a.minY - clearance) return false;
  for (const ringA of a.rings) for (const ringB of b.rings) {
    for (let i = 0; i < ringA.length; i++) for (let j = 0; j < ringB.length; j++) {
      if (edgesTouch(ringA[i], ringA[(i + 1) % ringA.length], ringB[j], ringB[(j + 1) % ringB.length], clearance)) return true;
    }
  }
  return a.polygons.some(polygon => contains(b, polygon.outer[0])) || b.polygons.some(polygon => contains(a, polygon.outer[0]));
}
