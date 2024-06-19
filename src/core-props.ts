import { Result } from './database.js';

/**
 * Skip login and use a randomly generated user ID.
 */
type NoLogin = {
  login: false;
};

/**
 * Display a login screen.
 */
type Login = {
  login: true;
  /**
   * The component to display for login.
   *
   * In the following example, the login component displays a button that always logs
   * in the user with the ID 'myUserId' when clicked:
   *
   * ```tsx
   * function MyLoginComponent() {
   *   const { login } = useContext(ExperimentControlsContext);
   *
   *   return (
   *     <button onClick={() => login('myUserId')}>Click me to log in!</button>
   *   );
   * }
   * ```
   *
   * In a real-world application, you would likely want each user to get a unique ID.
   */
  loginComponent: React.ReactNode;
};

/**
 * The type of login to use. If 'skip', a random user ID will be generated and used.
 */
type LoginOptions = NoLogin | Login;

type NoHandleError = {
  handleError: false;
};

type HandleError = {
  handleError?: true;
  renderErrorScreen: (event: ErrorEvent | PromiseRejectionEvent) => React.ReactNode;
};

type ErrorOptions = NoHandleError | HandleError;

type ExperimentProps = {
  children: React.ReactNode;
  endScreen?: React.ReactNode;
  errorOptions?: ErrorOptions;
  loginOptions?: LoginOptions;
  onResultAdded?: (result: Result) => void;
};

type Dynamic = {
  dynamic?: true;
  taskList: string[];
  onNextTask: (taskId: string) => void;
};

type Static = {
  dynamic: false;
};

type DynamicOptions = Dynamic | Static;

type ExperimentCoreProps = ExperimentProps & DynamicOptions;

export { ExperimentProps, ExperimentCoreProps, Dynamic, HandleError };
