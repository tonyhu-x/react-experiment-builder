import { createContext, useCallback, useMemo, useRef, useState } from 'react';

type Progress = {
  task: string;
  screen: string;

  /**
   * Like `updateTask`, but does nothing if progress has been restored previously.
   * If `tryRestoringProgress` hasn't been called, calling `initTask` will only update
   * local progress if `tryRestoringProgress` fails.
   */
  initTask: (newTask: string) => void;
  /**
   * Similar to `initScreen`.
   */
  initScreen: (newScreen: string) => void;
  /**
   * Calling updateTask with '' will clear local progress.
   */
  updateTask: (newTask: string) => void;
  updateScreen: (newScreen: string) => void;

  /**
   * Attempts to restore local progress.
   *
   * Progress is restored if user ID matches and the progress is newer than `maxAge`
   * seconds. Otherwise, any existing progress will be cleared and the provided
   * `userId` will be associated with new progress saved.
   *
   * Must be called before `updateTask` or `updateScreen` to set the user ID.
   * Otherwise, a later call to `tryRestoringProgress` will not be able to restore
   * progress, since the user ID will not match.
   *
   * @param userId user ID to restore local progress for
   * @param maxAge max age of local progress (in seconds) to restore
   * @returns the IDs of the restored task and screen, or ['', ''] if no progress was restored
   */
  tryRestoringProgress: (userId: string, maxAge: number) => [string, string];
};

const PROGRESS_ITEM_USERID = 'prog_userId';
const PROGRESS_ITEM_TIMESTAMP = 'prog_time';
const PROGRESS_ITEM_TASK = 'prog_task';
const PROGRESS_ITEM_SCREEN = 'prog_screen';

const ProgressDefault: Progress = {
  task: '',
  screen: '',
  initTask: () => { throw new Error('Progress context not found.'); },
  initScreen: () => { throw new Error('Progress context not found.'); },
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
  // Invariants:
  // - PROGRESS_ITEM_TIMESTAMP will be set iff PROGRESS_ITEM_TASK is.
  // - PROGRESS_ITEM_TASK cannot be ''.
  const [task, setTask] = useState('');
  const [screen, setScreen] = useState('');
  /**
   * Ref for communicating between `tryRestoringProgress` and `initTask`/`initScreen`.
   * - If there is pending progress to save from `initTask`/`initScreen`, this value
   * will be a tuple of the task and screen IDs.
   * - If `tryRestoringProgress` has already been called and failed, this value will
   * be `true`.
   * - If progress has been restored, this value will be `false`.
   */
  const deferredProgressRef = useRef<boolean | [string, string]>(['', '']);

  const tryRestoringProgress = useCallback((userId: string, maxAge: number): [string, string] => {
    if (typeof deferredProgressRef.current === 'boolean') {
      throw new Error('tryRestoringProgress should not be called twice.');
    }
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
      deferredProgressRef.current = false;
      // careful, we're ignoring the possibility of null here
      return [storedTask as string, storedScreen as string];
    }
    else {
      localStorage.setItem(PROGRESS_ITEM_USERID, userId);
      const [deferredTask, deferredScreen] = deferredProgressRef.current as [string, string];
      // clear stale local progress
      localStorage.removeItem(PROGRESS_ITEM_TASK);
      localStorage.removeItem(PROGRESS_ITEM_SCREEN);
      localStorage.removeItem(PROGRESS_ITEM_TIMESTAMP);
      if (deferredTask !== '') {
        updateTask(deferredTask);
      }
      if (deferredScreen !== '') {
        updateScreen(deferredScreen);
      }
      deferredProgressRef.current = true;
      return ['', ''];
    }
  }, [deferredProgressRef]);

  const initTask = useCallback((newTask: string) => {
    console.log(`Init task called, deferred task is ${deferredProgressRef.current}.`);
    if (deferredProgressRef.current === false) {
      // tryRestoringProgress succeeded
      return;
    }
    if (deferredProgressRef.current === true) {
      updateTask(newTask);
    }
    else {
      console.log('Here, new task is ' + newTask);
      setTask(newTask);
      deferredProgressRef.current[0] = newTask;
    }
  }, [deferredProgressRef]);

  const initScreen = useCallback((newScreen: string) => {
    if (deferredProgressRef.current === false) {
      // tryRestoringProgress succeeded
      return;
    }
    if (deferredProgressRef.current === true) {
      updateScreen(newScreen);
    }
    else {
      setScreen(newScreen);
      deferredProgressRef.current[1] = newScreen;
    }
  }, [deferredProgressRef]);

  const updateTask = useCallback((newTask: string) => {
    if (newTask === '') {
      throw new Error('Cannot update task to empty.');
    }
    setTask(newTask);
    localStorage.setItem(PROGRESS_ITEM_TASK, newTask);
    localStorage.setItem(PROGRESS_ITEM_TIMESTAMP, Date.now().toString());
  }, []);

  const updateScreen = useCallback((newScreen: string) => {
    if (newScreen === '') {
      throw new Error('Cannot update screen to empty.');
    }
    setScreen(newScreen);
    localStorage.setItem(PROGRESS_ITEM_SCREEN, newScreen);
    // only update timestamp if a task has been selected
    const storedTask = localStorage.getItem(PROGRESS_ITEM_TASK);
    if (storedTask) {
      localStorage.setItem(PROGRESS_ITEM_TIMESTAMP, Date.now().toString());
    }
  }, []);

  const progress = useMemo(() => ({
    task,
    screen,
    initTask,
    initScreen,
    updateTask,
    updateScreen,
    tryRestoringProgress,
  }), [task, screen, initTask, initScreen, updateTask, updateScreen, tryRestoringProgress]);

  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
}

export { ProgressContext, ProgressContextProvider };
