import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { Result, db } from './database.js';
import { DefaultEndScreen, renderDefaultErrorScreen } from './defaults.js';
import { createRoot } from 'react-dom/client';
import { Task } from './Task.js';
import type { ExperimentImplProps, HandleError } from './core-props.js';
import { ProgressContext, ProgressContextProvider } from './progress.js';

let errorHandlerEffectHasRun = false;

interface ExperimentInternals {
  registerTask: (id: string) => void;
  unregisterTask: (id: string) => void;
  advance: () => void;
  addResult: (taskId: string, screenId: string, key: string, val: string) => void;
}

interface ExperimentControls {
  login: (userId: string) => void;
  userId: string;
}

const ExperimentInternalsDefault: ExperimentInternals = {
  registerTask: () => { throw new Error('Experiment ancestor component not found.'); },
  unregisterTask: () => { throw new Error('Experiment ancestor component not found.'); },
  advance: () => { throw new Error('Experiment ancestor component not found.'); },
  addResult: () => { throw new Error('Experiment ancestor component not found.'); },
};

const ExperimentControlsDefault: ExperimentControls = {
  login: () => { throw new Error('Experiment ancestor component not found.'); },
  userId: '',
};

const ExperimentInternalsContext = createContext(ExperimentInternalsDefault);
const ExperimentControlsContext = createContext(ExperimentControlsDefault);

function ExperimentCore({
  endScreen = <DefaultEndScreen />,
  errorOptions = { handleError: true, renderErrorScreen: renderDefaultErrorScreen },
  loginOptions = { login: false },
  progressMaxAge = 300,
  ...otherProps
}: ExperimentImplProps) {
  if (otherProps.dynamic) {
    if (otherProps.taskList.length == 0) {
      throw new Error('taskList must not be empty.');
    }
    // check if the list contains duplicate entries
    if (new Set(otherProps.taskList).size != otherProps.taskList.length) {
      throw new Error('Two tasks must not share the same ID.');
    }
  }

  // valid user ID must not be empty
  const [userId, setUserId] = useState('');
  const [ended, setEnded] = useState(false);
  const allTasksRef = useRef<string[]>(otherProps.dynamic ? otherProps.taskList : []);
  const progress = useContext(ProgressContext);
  const loginHasRunRef = useRef(false);

  useEffect(() => {
    if (errorOptions.handleError && !errorHandlerEffectHasRun) {
      errorHandlerEffectHasRun = true;
      window.addEventListener('error', errorListener);
      window.addEventListener('unhandledrejection', errorListener);
    }
    if (!loginOptions.login) {
      // the login function itself makes sure it only runs once
      genUserIdDefault()
        .then((id) => {
          login(id);
        });
    }
  }, []);

  function errorListener(event: ErrorEvent | PromiseRejectionEvent) {
    document.body.innerHTML = '';
    const newDiv = document.createElement('div');
    const root = createRoot(newDiv);
    root.render(
      // this listener will only be added if errorOptions.handleError is true
      (errorOptions as HandleError).renderErrorScreen(event),
    );
    document.body.appendChild(newDiv);
  }

  const registerTask = useCallback((id: string) => {
    if (otherProps.dynamic) {
      return;
    }
    // no duplicate IDs allowed
    if (allTasksRef.current.includes(id)) {
      throw new Error(`Task ID '${id}' already exists. Two tasks must not share the same ID.`);
    }
    console.log(`Task registered with ID ${id}.`);
    const newTasks = [...allTasksRef.current, id];
    allTasksRef.current = newTasks;
    // if this is the first task, select it
    if (newTasks.length == 1) {
      progress.initTask(id);
    }
  }, [progress, allTasksRef]);

  const unregisterTask = useCallback((id: string) => {
    if (otherProps.dynamic) {
      return;
    }
    // do nothing if ID is not found
    if (allTasksRef.current.includes(id)) {
      console.log(`Task unregistered with ID ${id}.`);
      const newTasks = allTasksRef.current.filter(task => task != id);
      allTasksRef.current = newTasks;
    }
  }, [allTasksRef]);

  const advance = useCallback(() => {
    const curIndex = allTasksRef.current.indexOf(progress.task);
    if (curIndex < allTasksRef.current.length - 1) {
      progress.updateTask(allTasksRef.current[curIndex + 1]);
      if (otherProps.dynamic) {
        otherProps.onNextTask(allTasksRef.current[curIndex + 1]);
      }
    }
    else {
      setEnded(true);
    }
  }, [progress, allTasksRef]);

  const addResult = useCallback(async (taskId: string, screenId: string, key: string, val: string) => {
    const result: Result = { taskId, screenId, userId, key, val };
    await db.results.add(result);
    // TODO: Do I need error handling?

    if (otherProps.onResultAdded) {
      otherProps.onResultAdded(result);
    }
  }, [userId, otherProps.onResultAdded]);

  const experimentInternals = useMemo(() => ({
    registerTask,
    unregisterTask,
    advance,
    addResult,
  }), [registerTask, unregisterTask, advance, addResult]);

  const login = useCallback((newUserId: string) => {
    // prevent login from being run twice
    if (loginHasRunRef.current) {
      return;
    }
    loginHasRunRef.current = true;
    if (newUserId === '') {
      throw new Error('User ID must not be empty.');
    }
    setUserId(newUserId);
    const [taskRestored] = progress.tryRestoringProgress(newUserId, progressMaxAge);
    if (otherProps.dynamic) {
      if (taskRestored !== '') {
        otherProps.onNextTask(taskRestored);
      }
      else {
        progress.updateTask(allTasksRef.current[0]);
        otherProps.onNextTask(allTasksRef.current[0]);
      }
    }
  }, [loginHasRunRef, setUserId, userId, progress, allTasksRef]);

  const experimentControls = useMemo(() => ({
    login,
    userId,
  }), [login, userId]);

  let toDisplay;
  if (ended) {
    toDisplay = endScreen;
  }
  else if (loginOptions.login && userId == '') {
    toDisplay = loginOptions.loginComponent;
  }
  // prevent setting empty task ID on first render
  else if (otherProps.dynamic && progress.task != '') {
    // wrap in a <Task>
    toDisplay = (
      <Task id={progress.task}>
        {otherProps.children}
      </Task>
    );
  }
  else {
    toDisplay = otherProps.children;
  }

  return (
    <ExperimentInternalsContext.Provider value={experimentInternals}>
      <ExperimentControlsContext.Provider value={experimentControls}>
        {toDisplay}
      </ExperimentControlsContext.Provider>
    </ExperimentInternalsContext.Provider>
  );
};

/**
 * Internal component that implements experiment behaviour.
 *
 * The public-facing versions of this component are `<Experiment>` and `<ExperimentDynamic>`.
 */
function ExperimentImpl({ children, ...otherProps }: ExperimentImplProps) {
  return (
    <ProgressContextProvider>
      <ExperimentCore {...otherProps}>
        {children}
      </ExperimentCore>
    </ProgressContextProvider>
  );
};

export { ExperimentImpl, ExperimentInternalsContext, ExperimentControlsContext };
