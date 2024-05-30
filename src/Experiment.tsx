import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { Result, db } from './database.js';
import { DefaultEndScreen, renderDefaultErrorScreen } from './defaults.js';
import { createRoot } from 'react-dom/client';

interface ExperimentControls {
  addResult: (taskId: string, screenId: string, key: string, val: string) => void;
}

const ExperimentControlsDefault: ExperimentControls = {
  addResult: () => { throw new Error('Experiment ancestor component not found.'); },
};

export const ExperimentControlsContext = createContext(ExperimentControlsDefault);

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

  const experimentControls = useMemo(() => ({
    addResult,
  }), [addResult]);

  return (
    <ExperimentControlsContext.Provider value={experimentControls}>
      {ended ? endScreen : otherProps.children}
    </ExperimentControlsContext.Provider>
  );
};
