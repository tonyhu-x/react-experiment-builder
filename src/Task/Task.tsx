import React, { useState, createContext, useCallback } from 'react';

export const TaskHelperContext = createContext(() => {});

export function Task({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childArray = React.Children.toArray(children);

  const advance = useCallback(() => {
    if (currentIndex >= childArray.length - 1) {
      throw new Error('No more children to advance to.');
    }
    setCurrentIndex(currentIndex + 1);
  }, [currentIndex]);

  return (
    <TaskHelperContext.Provider value={advance}>
      {childArray[currentIndex]}
    </TaskHelperContext.Provider>
  );
};
