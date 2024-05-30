import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { Result, db } from './database.js';
import { DefaultEndScreen } from './DefaultEndScreen.js';

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
  children: React.ReactNode;
};

export function Experiment({
  endScreen = <DefaultEndScreen />,
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
