type LoginOptions = {
  /**
   * The type of login to use. If 'skip', a random user ID will be generated and used.
   */
  loginType: 'skip' | 'login';
  /**
   * The component to display for login. If loginType is 'skip', this is ignored.
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

export { LoginOptions };
