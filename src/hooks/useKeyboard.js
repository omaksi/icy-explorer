import { useState, useEffect } from 'react';

export const useKeyboard = (onSpace, onInventory) => {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const keyMap = {
      'w': 'ArrowUp', 'W': 'ArrowUp',
      's': 'ArrowDown', 'S': 'ArrowDown',
      'a': 'ArrowLeft', 'A': 'ArrowLeft',
      'd': 'ArrowRight', 'D': 'ArrowRight',
    };

    const handleKeyDown = (e) => {
      const mappedKey = keyMap[e.key] || e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(mappedKey)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [mappedKey]: true }));
      }
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        onSpace?.();
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onInventory?.();
      }
    };

    const handleKeyUp = (e) => {
      const mappedKey = keyMap[e.key] || e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(mappedKey)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [mappedKey]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSpace, onInventory]);

  return keys;
};
