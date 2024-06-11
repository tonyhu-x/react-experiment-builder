export function DefaultEndScreen() {
  return (
    <>
      <h2>Thank you</h2>
      <p>That is all for today!</p>
    </>
  );
}

export function renderDefaultErrorScreen(event: ErrorEvent | PromiseRejectionEvent) {
  return (
    <>
      <h2>Oops! An unexpected error has occurred.</h2>
      <p>Please let the experimenter know. Here are the error details:</p>
      {
        event instanceof ErrorEvent ? <p>{event.error.message}</p> : <p>{event.reason}</p>
      }
    </>
  );
};
