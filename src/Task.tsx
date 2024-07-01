import React, { createContext, useCallback, useMemo, useContext, useEffect, useRef } from 'react';
import { ExperimentInternalsContext } from './core.js';
import { ProgressContext } from './progress.js';

interface TaskInternals {
  registerScreen: (id: string) => void;
  unregisterScreen: (id: string) => void;
  advance: () => void;
  addResult: (screenId: string, key: string, val: string) => void;
}

const TaskInternalsDefault: TaskInternals = {
  registerScreen: () => { throw new Error('Task ancestor component not found.'); },
  unregisterScreen: () => { throw new Error('Task ancestor component not found.'); },
  advance: () => { throw new Error('Task ancestor component not found.'); },
  addResult: () => { throw new Error('Task ancestor component not found.'); },
};

const TaskInternalsContext = createContext(TaskInternalsDefault);

type TaskProps = {
  id: string;
  children: React.ReactNode;
};

function Task(props: TaskProps) {
  if (props.id == '') {
    throw new Error('Task ID cannot be an empty string.');
  }

  const allScreensRef = useRef<string[]>([]);
  const experimentInternals = useContext(ExperimentInternalsContext);

  const progress = useContext(ProgressContext);

  useEffect(() => {
    experimentInternals.registerTask(props.id);
    return () => {
      experimentInternals.unregisterTask(props.id);
    };
  }, []);

  const registerScreen = useCallback((id: string) => {
    // no duplicate IDs allowed
    if (allScreensRef.current.includes(id)) {
      throw new Error(`Screen ID '${id}' already exists.`);
    }
    console.log(`Screen registered with ID ${id}.`);
    const newScreens = [...allScreensRef.current, id];
    allScreensRef.current = newScreens;
    // if this is the first screen, select it
    if (newScreens.length == 1) {
      progress.initScreen(id);
    }
  }, [allScreensRef]);

  const unregisterScreen = useCallback((id: string) => {
    // do nothing if ID is not found
    if (allScreensRef.current.includes(id)) {
      console.log(`Screen unregistered with ID ${id}.`);
      const newScreens = allScreensRef.current.filter(screen => screen != id);
      allScreensRef.current = newScreens;
    }
  }, [allScreensRef]);

  const advance = useCallback(() => {
    const curIndex = allScreensRef.current.indexOf(progress.screen);
    if (curIndex < allScreensRef.current.length - 1) {
      progress.updateScreen(allScreensRef.current[curIndex + 1]);
    }
    else {
      experimentInternals.advance();
    }
  }, [progress, allScreensRef, experimentInternals.advance]);

  const addResult = useCallback(async (screenId: string, key: string, val: string) => {
    await experimentInternals.addResult(props.id, screenId, key, val);
  }, [props.id, experimentInternals.addResult]);

  const taskInternals = useMemo(() => ({
    registerScreen,
    unregisterScreen,
    advance,
    addResult,
  }), [registerScreen, unregisterScreen, advance, addResult]);

  return (
    <TaskInternalsContext.Provider value={taskInternals}>
      {progress.task == props.id && props.children}
    </TaskInternalsContext.Provider>
  );
};

export { TaskInternalsContext, Task };
