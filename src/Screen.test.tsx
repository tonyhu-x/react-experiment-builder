import { act, fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { Task } from './Task.js';
import { Screen, ScreenControlsContext } from './Screen.js';
import { Experiment } from './Experiment.js';

function AdvanceButton() {
  const screenControls = useContext(ScreenControlsContext);

  return (
    <button onClick={screenControls.advance}>Click me</button>
  );
}

test('Only the first screen is rendered at first', async () => {
  // async is needed because Experiment has a useEffect containing an async state update
  await act(async () => {
    render(
      <Experiment>
        <Task id='test'>
          <Screen id='hello'>
            <p>Hello</p>
          </Screen>
          <Screen id='world'>
            <p>World</p>
          </Screen>
        </Task>
      </Experiment>,
    );
  });

  expect(screen.queryByText('Hello')).not.toBeNull();
  expect(screen.queryByText('World')).toBeNull();
});

test('Only the second screen is rendered after advance is called', async () => {
  await act(async () => {
    render(
      <Experiment>
        <Task id='test'>
          <Screen id='hello'>
            <AdvanceButton />
            <p>Hello</p>
          </Screen>
          <Screen id='world'>
            <p>World</p>
          </Screen>
        </Task>
      </Experiment>,
    );
  });

  fireEvent.click(screen.getByRole('button'));

  expect(screen.queryByText('Hello')).toBeNull();
  expect(screen.queryByText('World')).not.toBeNull();
});

test('Calling advance shows the second Task after the last Screen in the first Task', async () => {
  await act(async () => {
    render(
      <Experiment>
        <Task id='test'>
          <Screen id='hello'>
            <AdvanceButton />
            <p>Hello</p>
          </Screen>
        </Task>
        <Task id='test2'>
          <p>World</p>
        </Task>
      </Experiment>,
    );
  });

  fireEvent.click(screen.getByRole('button'));

  expect(screen.queryByText('Hello')).toBeNull();
  expect(screen.queryByText('World')).not.toBeNull();
});
