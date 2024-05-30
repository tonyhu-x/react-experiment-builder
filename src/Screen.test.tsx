
import { fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { Task } from './Task.js';
import { Screen, ScreenControlsContext } from './Screen.js';

function AdvanceButton() {
  const screenControls = useContext(ScreenControlsContext);

  return (
    <button onClick={screenControls.advance}>Click me</button>
  );
}

function TestComponent({ text }: { text: string }) {
  return (
    <>
      <AdvanceButton />
      <p>{text}</p>
    </>
  );
}

test('The correct screen is rendered', () => {
  render(
    <Task id='test'>
      <Screen id='hello'>
        <TestComponent text='Hello' />
      </Screen>
      <Screen id='world'>
        <TestComponent text='World' />
      </Screen>
    </Task>,
  );

  expect(screen.queryByText('Hello')).not.toBeNull();
  expect(screen.queryByText('World')).toBeNull();

  fireEvent.click(screen.getByRole('button'));

  expect(screen.queryByText('Hello')).toBeNull();
  expect(screen.queryByText('World')).not.toBeNull();
});
