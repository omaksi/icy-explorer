import { useEffect, useCallback } from 'react';
import { WORLD_WIDTH, TILE_SIZE } from '../constants';
import { generateCave, generateCaveTreasures } from '../world/caveGeneration';

export const useInteraction = ({
  // Game state
  nearbyTreasure,
  nearbyCave,
  nearbyExit,
  inCave,
  player,
  overworldPosition,
  // State setters
  setPlayerPosition,
  setOverworldPosition,
  setTreasures,
  setCaveTreasures,
  setShowWordPopup,
  setCollectedWords,
  setCaveMap,
  setInCave,
  resetCaveExploration,
  setShowCollectionAnimation,
}) => {
  const handleInteraction = useCallback(() => {
    // Handle treasure interaction
    if (nearbyTreasure !== null) {
      const setterFn = inCave ? setCaveTreasures : setTreasures;
      setterFn(prev => prev.map(t => {
        if (t.id === nearbyTreasure) {
          if (!t.opened) {
            setShowWordPopup({ word: t.word, id: t.id });
            return { ...t, opened: true };
          } else if (!t.collected) {
            setCollectedWords(words => [...words, t.word]);
            setShowWordPopup(null);
            setShowCollectionAnimation({ word: t.word });
            return { ...t, collected: true };
          }
        }
        return t;
      }));
      return;
    }

    // Handle cave entry
    if (!inCave && nearbyCave !== null) {
      setOverworldPosition({ x: player.x, y: player.y });
      const seed = nearbyCave.y * WORLD_WIDTH + nearbyCave.x;
      const newCave = generateCave(seed);
      setCaveMap(newCave);
      const newCaveTreasures = generateCaveTreasures(newCave, seed);
      setCaveTreasures(newCaveTreasures);
      setPlayerPosition(4 * TILE_SIZE, 4 * TILE_SIZE);
      resetCaveExploration();
      setInCave(true);
      return;
    }

    // Handle cave exit
    if (inCave && nearbyExit) {
      if (overworldPosition) {
        setPlayerPosition(overworldPosition.x, overworldPosition.y);
      }
      setInCave(false);
      setCaveMap(null);
      setCaveTreasures([]);
    }
  }, [
    nearbyTreasure, nearbyCave, nearbyExit, inCave, player, overworldPosition,
    setPlayerPosition, setOverworldPosition, setTreasures, setCaveTreasures,
    setShowWordPopup, setCollectedWords, setCaveMap, setInCave, resetCaveExploration,
    setShowCollectionAnimation
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== ' ' && e.key !== 'Space') return;
      e.preventDefault();
      handleInteraction();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteraction]);

  return { handleInteraction };
};
