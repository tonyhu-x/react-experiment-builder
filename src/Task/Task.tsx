import React, { useState, createContext, useCallback } from 'react';

export const TaskHelperContext = createContext(() => {});

export type TaskProps = {
  id: number;
  children: React.ReactNode;
};

export function Task(props: TaskProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childArray = React.Children.toArray(props.children);

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
