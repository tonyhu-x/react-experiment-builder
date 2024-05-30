import React, { createContext, useCallback, useMemo, useContext, useEffect, useRef, useReducer } from 'react';
import { ExperimentControlsContext } from './Experiment.js';

interface TaskInternals {
  currentScreen: string;
  registerScreen: (id: string) => void;
  unregisterScreen: (id: string) => void;
  advance: () => void;
  addResult: (screenId: string, key: string, val: string) => void;
}

const TaskInternalsDefault: TaskInternals = {
  currentScreen: '',
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
  const allScreensRef = useRef<string[]>([]);
  const screenRef = useRef('');
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const experimentControls = useContext(ExperimentControlsContext);

  function updateCurrentScreen(id: string) {
    screenRef.current = id;
    forceUpdate();
  };

  const advance = useCallback(() => {
    const curIndex = allScreensRef.current.indexOf(screenRef.current);
    if (curIndex < allScreensRef.current.length - 1) {
      updateCurrentScreen(allScreensRef.current[curIndex + 1]);
    }
    else {
      // advance to next task
    }
  }, [screenRef, allScreensRef]);

  const addResult = useCallback(async (screenId: string, key: string, val: string) => {
    await experimentControls.addResult(props.id, screenId, key, val);
  }, [props.id, experimentControls.addResult]);

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
      updateCurrentScreen(id);
    }
  }, [screenRef, allScreensRef]);

  const unregisterScreen = useCallback((id: string) => {
    // do nothing if ID is not found
    if (allScreensRef.current.includes(id)) {
      console.log(`Screen unregistered with ID ${id}.`);
      const newScreens = allScreensRef.current.filter(screen => screen != id);
      allScreensRef.current = newScreens;
      if (newScreens.length == 0) {
        updateCurrentScreen('');
      }
    }
  }, [screenRef, allScreensRef]);

  const taskInternals = useMemo(() => ({
    currentScreen: screenRef.current,
    registerScreen,
    unregisterScreen,
    advance,
    addResult,
  }), [screenRef.current, registerScreen, unregisterScreen, advance, addResult]);

  return (
    <TaskInternalsContext.Provider value={taskInternals}>
      {props.children}
    </TaskInternalsContext.Provider>
  );
};

export { TaskInternalsContext, Task };
