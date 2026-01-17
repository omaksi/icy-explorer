export const CAVE_TILES = {
  FLOOR: 0,
  WALL: 1,
  ICE_SPIKE: 2,
  ORE: 3,
  CRYSTAL: 4,
  EXIT: 5,
};

export const CAVE_TILE_COLORS = {
  [CAVE_TILES.FLOOR]: '#374151',
  [CAVE_TILES.WALL]: '#1f2937',
  [CAVE_TILES.ICE_SPIKE]: '#7dd3fc',
  [CAVE_TILES.ORE]: '#92400e',
  [CAVE_TILES.CRYSTAL]: '#a855f7',
  [CAVE_TILES.EXIT]: '#4ade80',
};

export const isCaveWalkable = (tile) => {
  return tile !== CAVE_TILES.WALL && tile !== CAVE_TILES.ICE_SPIKE;
};
