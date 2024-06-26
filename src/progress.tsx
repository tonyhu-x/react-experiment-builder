import { createContext, useCallback, useMemo, useState } from 'react';

type Progress = {
  task: string;
  screen: string;
  updateTask: (newTask: string) => void;
  updateScreen: (newScreen: string) => void;
  /**
   * Attempts to restore local progress.
   *
   * Progress is restored if user ID matches and the progress is newer than `maxAge`
   * seconds. Otherwise, any existing progress will be cleared and the provided
   * `userId` will be associated with new progress saved.
   *
   * @param userId user ID to restore local progress for
   * @param maxAge max age of local progress (in seconds) to restore
   * @returns the ID of the restored task, or '' if no progress was restored
   */
  tryRestoringProgress: (userId: string, maxAge: number) => string;
};

const PROGRESS_ITEM_USERID = 'prog_userId';
const PROGRESS_ITEM_TIMESTAMP = 'prog_time';
const PROGRESS_ITEM_TASK = 'prog_task';
const PROGRESS_ITEM_SCREEN = 'prog_screen';

const ProgressDefault: Progress = {
  task: '',
  screen: '',
  updateTask: () => { throw new Error('Progress context not found.'); },
  updateScreen: () => { throw new Error('Progress context not found.'); },
  tryRestoringProgress: () => { throw new Error('Progress context not found.'); },
};

const ProgressContext = createContext<Progress>(ProgressDefault);

/**
 * Component that manages local progress.
 *
 * Provides a ProgressContext.
 */
function ProgressContextProvider({ children }: { children: React.ReactNode }) {
  const [task, setTask] = useState('');
  const [screen, setScreen] = useState('');

  const tryRestoringProgress = useCallback((userId: string, maxAge: number) => {
    if (maxAge <= 0) {
      throw new Error('maxAge must be positive.');
    }
    const id = localStorage.getItem(PROGRESS_ITEM_USERID);
    const t = localStorage.getItem(PROGRESS_ITEM_TIMESTAMP);
    if (id && t && id == userId && Date.now() - parseInt(t) < maxAge * 1000) {
      const storedTask = localStorage.getItem(PROGRESS_ITEM_TASK);
      const storedScreen = localStorage.getItem(PROGRESS_ITEM_SCREEN);
      setTask(storedTask!);
      setScreen(storedScreen!);
      // careful, we're ignoring the possibility of null here
      return (storedTask as string);
    }
    else {
      // remove stale local progress
      localStorage.setItem(PROGRESS_ITEM_USERID, userId);
      localStorage.removeItem(PROGRESS_ITEM_TIMESTAMP);
      localStorage.removeItem(PROGRESS_ITEM_TASK);
      localStorage.removeItem(PROGRESS_ITEM_SCREEN);
      return '';
    }
  }, []);

  const updateTask = useCallback((newTask: string) => {
    setTask(newTask);
    if (newTask === '') {
      localStorage.removeItem(PROGRESS_ITEM_TIMESTAMP);
      localStorage.removeItem(PROGRESS_ITEM_TASK);
      localStorage.removeItem(PROGRESS_ITEM_SCREEN);
    }
    localStorage.setItem(PROGRESS_ITEM_TASK, newTask);
    localStorage.setItem(PROGRESS_ITEM_TIMESTAMP, Date.now().toString());
  }, []);

  const updateScreen = useCallback((newScreen: string) => {
    setTask(newScreen);
    localStorage.setItem(PROGRESS_ITEM_SCREEN, newScreen);
    localStorage.setItem(PROGRESS_ITEM_TIMESTAMP, Date.now().toString());
  }, []);

  const progress = useMemo(() => ({
    task,
    screen,
    updateTask,
    updateScreen,
    tryRestoringProgress,
  }), [task, screen, updateTask, updateScreen, tryRestoringProgress]);

  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
}

export { ProgressContext, ProgressContextProvider };
