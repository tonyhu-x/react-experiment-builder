import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { Result, db } from './database.js';
import { DefaultEndScreen, renderDefaultErrorScreen } from './defaults.js';
import { createRoot } from 'react-dom/client';

interface ExperimentInternals {
  currentTask: string;
  registerTask: (id: string) => void;
  unregisterTask: (id: string) => void;
  advance: () => void;
  addResult: (taskId: string, screenId: string, key: string, val: string) => void;
}

const ExperimentInternalsDefault: ExperimentInternals = {
  currentTask: '',
  registerTask: () => { throw new Error('Experiment ancestor component not found.'); },
  unregisterTask: () => { throw new Error('Experiment ancestor component not found.'); },
  advance: () => { throw new Error('Experiment ancestor component not found.'); },
  addResult: () => { throw new Error('Experiment ancestor component not found.'); },
};

export const ExperimentInternalsContext = createContext(ExperimentInternalsDefault);

export type ExperimentProps = {
  genUserId?: () => Promise<string>;
  onResultAdded?: (result: Result) => void;
  endScreen?: React.ReactNode;
  useErrorHandling?: boolean;
  renderErrorScreen?: (event: ErrorEvent | PromiseRejectionEvent) => React.ReactNode;
  children: React.ReactNode;
};

let errorHandlerEffectRun = false;

export function Experiment({
  endScreen = <DefaultEndScreen />,
  useErrorHandling = false,
  renderErrorScreen = renderDefaultErrorScreen,
  genUserId = genUserIdDefault,
  ...otherProps
}: ExperimentProps) {
  // valid user ID must not be empty
  const [userId, setUserId] = useState('');
  const [ended, setEnded] = useState(false);
  const allTasksRef = useRef<string[]>([]);
  const taskRef = useRef('');
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  function updateCurrentTask(id: string) {
    taskRef.current = id;
    forceUpdate();
  };

  const advance = useCallback(() => {
    const curIndex = allTasksRef.current.indexOf(taskRef.current);
    if (curIndex < allTasksRef.current.length - 1) {
      updateCurrentTask(allTasksRef.current[curIndex + 1]);
    }
    else {
      setEnded(true);
    }
  }, [taskRef, allTasksRef]);

  useEffect(() => {
    if (userId == '') {
      genUserId()
        .then((id) => {
          setUserId(id);
        });
    }
  }, []);

  function errorListener(event: ErrorEvent | PromiseRejectionEvent) {
    document.body.innerHTML = '';
    const newDiv = document.createElement('div');
    const root = createRoot(newDiv);
    root.render(
      renderErrorScreen(event),
    );
    document.body.appendChild(newDiv);
  }

  useEffect(() => {
    if (useErrorHandling && !errorHandlerEffectRun) {
      errorHandlerEffectRun = true;
      window.addEventListener('error', errorListener);
      window.addEventListener('unhandledrejection', errorListener);
    }
  }, []);

  const addResult = useCallback(async (taskId: string, screenId: string, key: string, val: string) => {
    const result: Result = { taskId, screenId, userId, key, val };
    await db.results.add(result);
    // TODO: Do I need error handling?

    if (otherProps.onResultAdded) {
      otherProps.onResultAdded(result);
    }
  }, [userId, otherProps.onResultAdded]);

  const registerTask = useCallback((id: string) => {
    // no duplicate IDs allowed
    if (allTasksRef.current.includes(id)) {
      throw new Error(`Task ID '${id}' already exists.`);
    }
    console.log(`Task registered with ID ${id}.`);
    const newTasks = [...allTasksRef.current, id];
    allTasksRef.current = newTasks;
    // if this is the first task, select it
    if (newTasks.length == 1) {
      updateCurrentTask(id);
    }
  }, [taskRef, allTasksRef]);

  const unregisterTask = useCallback((id: string) => {
    // do nothing if ID is not found
    if (allTasksRef.current.includes(id)) {
      console.log(`Task unregistered with ID ${id}.`);
      const newTasks = allTasksRef.current.filter(task => task != id);
      allTasksRef.current = newTasks;
      if (newTasks.length == 0) {
        updateCurrentTask('');
      }
    }
  }, [taskRef, allTasksRef]);

  const experimentInternals = useMemo(() => ({
    currentTask: taskRef.current,
    registerTask,
    unregisterTask,
    advance,
    addResult,
  }), [taskRef.current, registerTask, unregisterTask, advance, addResult]);

  return (
    <ExperimentInternalsContext.Provider value={experimentInternals}>
      {ended ? endScreen : otherProps.children}
    </ExperimentInternalsContext.Provider>
  );
};
