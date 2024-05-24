import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { genUserIdDefault } from './utils.js';
import { db } from './database.js';

interface ExperimentControls {
  hasExperiment: boolean;
  addResult: (taskId: string, key: string, val: string) => void;
}

const ExperimentControlsDefault: ExperimentControls = {
  hasExperiment: false,
  addResult: () => { throw new Error('Experiment ancestor component not found.'); },
};

export const ExperimentControlsContext = createContext(ExperimentControlsDefault);

type ExperimentProps = {
  genUserId?: () => Promise<string>;
  children: React.ReactNode;
};

export function Experiment(props: ExperimentProps) {
  // valid user ID must not be empty
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (userId == '') {
      if (props.genUserId) {
        props.genUserId()
          .then((id) => {
            setUserId(id);
          });
      }
      else {
        setUserId(genUserIdDefault());
      }
    }
  }, []);

  const addResult = useCallback(async (taskId: string, key: string, val: string) => {
    await db.results.add({ taskId, userId, key, val });
    // TODO: Do I need error handling?
  }, [userId]);

  const experimentControls = useMemo(() => ({
    hasExperiment: true,
    addResult,
  }), [addResult]);

  return (
    <ExperimentControlsContext.Provider value={experimentControls}>
      {props.children}
    </ExperimentControlsContext.Provider>
  );
};
