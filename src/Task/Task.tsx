import React, { useState, createContext, useCallback, useMemo } from 'react';
import { db } from '../database.js';

interface TaskControls {
  advance: () => void;
  addResult: (key: string, val: string) => void;
}

export const TaskControlsContext = createContext({
  advance: () => { throw new Error('Task ancestor component not found.'); },
  addResult: () => { throw new Error('Task ancestor component not found.'); },
} as TaskControls);

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

  const addResult = useCallback(async (key: string, val: string) => {
    await db.results.add({ taskId: props.id, key: key, val: val });
    // TODO: Do I need error handling?
  }, [props.id]);

  const taskControls = useMemo(() => ({
    advance,
    addResult,
  }), [advance, addResult]);

  return (
    <TaskControlsContext.Provider value={taskControls}>
      {childArray[currentIndex]}
    </TaskControlsContext.Provider>
  );
};
