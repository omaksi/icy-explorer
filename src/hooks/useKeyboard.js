import { useState, useEffect } from 'react';

export const useKeyboard = (onSpace, onInventory) => {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [e.key]: true }));
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
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [e.key]: false }));
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
