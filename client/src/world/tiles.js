export const TILES = {
  SNOW: 0,
  ICE: 1,
  TREE: 2,
  ROCK: 3,
  CAVE_ENTRANCE: 4,
  FROZEN_LAKE: 5,
  DEEP_SNOW: 6,
};

export const TILE_COLORS = {
  [TILES.SNOW]: '#e8f4f8',
  [TILES.ICE]: '#a8d8ea',
  [TILES.TREE]: '#e8f4f8',
  [TILES.ROCK]: '#9ca3af',
  [TILES.CAVE_ENTRANCE]: '#1f2937',
  [TILES.FROZEN_LAKE]: '#7dd3fc',
  [TILES.DEEP_SNOW]: '#d1e7ed',
};

export const isWalkable = (tile) => {
  return tile !== TILES.TREE && tile !== TILES.ROCK;
};
