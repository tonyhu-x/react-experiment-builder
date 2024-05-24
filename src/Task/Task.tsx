import React, { useState, createContext, useCallback, useMemo, useContext, useEffect } from 'react';
import { ExperimentControlsContext } from '../Experiment.js';

interface TaskControls {
  advance: () => void;
  addResult: (key: string, val: string) => void;
}

const TaskControlsDefault: TaskControls = {
  advance: () => { throw new Error('Task ancestor component not found.'); },
  addResult: () => { throw new Error('Task ancestor component not found.'); },
};

export const TaskControlsContext = createContext(TaskControlsDefault);

export type TaskProps = {
  id: string;
  children: React.ReactNode;
};

export function Task(props: TaskProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childArray = React.Children.toArray(props.children);

  const experimentControls = useContext(ExperimentControlsContext);

  useEffect(() => {
    if (!experimentControls.hasExperiment) {
      throw new Error('Task must be a descendant node of Experiment.');
    }
  }, []);

  const advance = useCallback(() => {
    if (currentIndex >= childArray.length - 1) {
      throw new Error('No more children to advance to.');
    }
    setCurrentIndex(currentIndex + 1);
  }, [currentIndex]);

  const addResult = useCallback(async (key: string, val: string) => {
    await experimentControls.addResult(props.id, key, val);
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
