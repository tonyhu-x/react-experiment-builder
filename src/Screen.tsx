import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { TaskInternalsContext } from './Task.js';

interface ScreenControls {
  advance: () => void;
  addResult: (key: string, val: string) => void;
}

const ScreenControlsDefault: ScreenControls = {
  advance: () => { throw new Error('Task ancestor component not found.'); },
  addResult: () => { throw new Error('Task ancestor component not found.'); },
};

export const ScreenControlsContext = createContext(ScreenControlsDefault);

export type ScreenProps = {
  id: string;
  children: ReactNode;
};

interface ScreenControls {
  advance: () => void;
  addResult: (key: string, val: string) => void;
}

export function Screen(props: ScreenProps) {
  const taskInternals = useContext(TaskInternalsContext);

  const advance = useCallback(() => {
    taskInternals.advance();
  }, [taskInternals.advance]);

  const addResult = useCallback((key: string, val: string) => {
    taskInternals.addResult(props.id, key, val);
  }, [props.id, taskInternals.addResult]);

  const screenControls = useMemo(() => ({
    advance,
    addResult,
  }), [advance, addResult]);

  useEffect(() => {
    if (props.id == '') {
      throw new Error('Screen ID cannot be an empty string.');
    }
    taskInternals.registerScreen(props.id);
    return () => {
      taskInternals.unregisterScreen(props.id);
    };
  }, []);

  return (
    <ScreenControlsContext.Provider value={screenControls}>
      {taskInternals.currentScreen == props.id && props.children}
    </ScreenControlsContext.Provider>
  );
}
