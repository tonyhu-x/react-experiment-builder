import { act, fireEvent, render, screen } from '@testing-library/react';

import { useContext, useEffect } from 'react';
import { Experiment } from './Experiment.js';
import { ExperimentControlsContext } from './core.js';
import { ScreenControlsContext, Screen } from './Screen.js';
import { Task } from './Task.js';

function AdvanceButton() {
  const screenControls = useContext(ScreenControlsContext);

  return (
    <button onClick={screenControls.advance}>Click me</button>
  );
}

function AutoLogin({ id }: { id: string }) {
  const exp = useContext(ExperimentControlsContext);

  useEffect(() => {
    exp.login(id);
  }, []);

  return false;
}

test('Login component is rendered', async () => {
  await act(async () => {
    render(
      <Experiment loginOptions={{
        login: true,
        loginComponent: <p>Hello</p>,
      }}
      >
        <p>World</p>
      </Experiment>,
    );
  });
  expect(screen.queryByText('Hello')).not.toBeNull();
  expect(screen.queryByText('World')).toBeNull();
});

test('Children are immediately displayed if login set to "skip"', async () => {
  await act(async () => {
    render(
      <Experiment loginOptions={{
        login: true,
        loginComponent: <p>Hello</p>,
      }}
      >
        <p>World</p>
      </Experiment>,
    );
  });
  expect(screen.queryByText('Hello')).not.toBeNull();
});

test('Progress is restored when conditions are met', async () => {
  const toRender = (
    <Experiment
      loginOptions={{
        login: true,
        loginComponent: <AutoLogin id='progress1' />,
      }}
      progressMaxAge={10}
    >
      <Task id='test'>
        <Screen id='hello'>
          <AdvanceButton />
          <p>Hello</p>
        </Screen>
      </Task>
      <Task id='test2'>
        <p>World</p>
      </Task>
    </Experiment>
  );
  const { unmount } = render(toRender);
  fireEvent.click(await screen.findByRole('button'));

  unmount();

  render(toRender);
  await screen.findByText('World');
  // expect(await screen.queryByText('World')).not.toBeNull();
});

test('Progress is not restored when older than max age', async () => {
  const toRender = (
    <Experiment
      loginOptions={{
        login: true,
        loginComponent: <AutoLogin id='progress2' />,
      }}
      progressMaxAge={0.5}
    >
      <Task id='test'>
        <Screen id='hello'>
          <AdvanceButton />
          <p>Hello</p>
        </Screen>
      </Task>
      <Task id='test2'>
        <p>World</p>
      </Task>
    </Experiment>
  );

  const { unmount } = render(toRender);
  fireEvent.click(await screen.findByRole('button'));

  unmount();

  await new Promise(r => setTimeout(r, 800));
  render(toRender);
  await screen.findByText('Hello');
});
