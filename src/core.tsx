import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { Result, db } from './database.js';
import { DefaultEndScreen, renderDefaultErrorScreen } from './defaults.js';
import { createRoot } from 'react-dom/client';
import { LoginOptions } from './login.js';
import { Task } from './Task.js';

let errorHandlerEffectRun = false;

interface ExperimentInternals {
  currentTask: string;
  registerTask: (id: string) => void;
  unregisterTask: (id: string) => void;
  advance: () => void;
  addResult: (taskId: string, screenId: string, key: string, val: string) => void;
}

interface ExperimentControls {
  login: (userId: string) => void;
}

const ExperimentInternalsDefault: ExperimentInternals = {
  currentTask: '',
  registerTask: () => { throw new Error('Experiment ancestor component not found.'); },
  unregisterTask: () => { throw new Error('Experiment ancestor component not found.'); },
  advance: () => { throw new Error('Experiment ancestor component not found.'); },
  addResult: () => { throw new Error('Experiment ancestor component not found.'); },
};

const ExperimentControlsDefault: ExperimentControls = {
  login: () => { throw new Error('Experiment ancestor component not found.'); },
};

const ExperimentInternalsContext = createContext(ExperimentInternalsDefault);
const ExperimentControlsContext = createContext(ExperimentControlsDefault);

type Dynamic = {
  dynamic?: true;
  taskList: string[];
  onNextTask: (taskId: string) => void;
};

type Static = {
  dynamic: false;
};

type DynamicOptions = Dynamic | Static;

type ExperimentProps = {
  children: React.ReactNode;
  endScreen?: React.ReactNode;
  loginOptions?: LoginOptions;
  onResultAdded?: (result: Result) => void;
  renderErrorScreen?: (event: ErrorEvent | PromiseRejectionEvent) => React.ReactNode;
  useErrorHandling?: boolean;
};

type ExperimentCoreProps = ExperimentProps & DynamicOptions;

/**
 * Component that implements core experiment behaviour.
 *
 * The public-facing versions of this component are `<Experiment>` and `<ExperimentDynamic>`.
 */
function ExperimentCore({
  loginOptions = { loginType: 'skip', loginComponent: <> </> },
  endScreen = <DefaultEndScreen />,
  useErrorHandling = false,
  renderErrorScreen = renderDefaultErrorScreen,
  ...otherProps
}: ExperimentCoreProps) {
  // valid user ID must not be empty
  const [userId, setUserId] = useState('');
  const [ended, setEnded] = useState(false);
  const allTasksRef = useRef<string[]>([]);
  const taskRef = useRef('');
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (loginOptions.loginType == 'skip' && userId == '') {
      genUserIdDefault()
        .then((id) => {
          login(id);
        });
    }
    if (useErrorHandling && !errorHandlerEffectRun) {
      errorHandlerEffectRun = true;
      window.addEventListener('error', errorListener);
      window.addEventListener('unhandledrejection', errorListener);
    }
    if (otherProps.dynamic) {
      if (otherProps.taskList.length == 0) {
        throw new Error('taskList must not be empty.');
      }
      // check if the list contains duplicate entries
      if (new Set(otherProps.taskList).size != otherProps.taskList.length) {
        throw new Error('Two tasks must not share the same ID.');
      }
      allTasksRef.current = otherProps.taskList;
      // cannot call advance() directly because in strict mode the effect runs twice
      updateCurrentTask(allTasksRef.current[0]);
      otherProps.onNextTask(taskRef.current);
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
      updateCurrentTask(id);
    }
  }, [taskRef, allTasksRef]);

  const unregisterTask = useCallback((id: string) => {
    if (otherProps.dynamic) {
      return;
    }
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

  function updateCurrentTask(id: string) {
    taskRef.current = id;
    forceUpdate();
  };

  const advance = useCallback(() => {
    const curIndex = allTasksRef.current.indexOf(taskRef.current);
    if (curIndex < allTasksRef.current.length - 1) {
      updateCurrentTask(allTasksRef.current[curIndex + 1]);
      if (otherProps.dynamic) {
        otherProps.onNextTask(taskRef.current);
      }
    }
    else {
      setEnded(true);
    }
  }, [taskRef, allTasksRef]);

  const addResult = useCallback(async (taskId: string, screenId: string, key: string, val: string) => {
    const result: Result = { taskId, screenId, userId, key, val };
    await db.results.add(result);
    // TODO: Do I need error handling?

    if (otherProps.onResultAdded) {
      otherProps.onResultAdded(result);
    }
  }, [userId, otherProps.onResultAdded]);

  const experimentInternals = useMemo(() => ({
    currentTask: taskRef.current,
    registerTask,
    unregisterTask,
    advance,
    addResult,
  }), [taskRef.current, registerTask, unregisterTask, advance, addResult]);

  const login = useCallback((userId: string) => {
    setUserId(userId);
  }, [setUserId]);

  const experimentControls = useMemo(() => ({
    login,
  }), [login]);

  let toDisplay;
  if (ended) {
    toDisplay = endScreen;
  }
  else if (userId == '') {
    toDisplay = loginOptions.loginComponent;
  }
  else if (otherProps.dynamic) {
    // wrap in a <Task>
    toDisplay = (
      <Task id={taskRef.current}>
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

export { ExperimentCore, ExperimentInternalsContext, ExperimentControlsContext, ExperimentProps, Dynamic };
