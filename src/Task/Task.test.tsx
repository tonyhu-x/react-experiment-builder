import { fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { Task, TaskControlsContext } from './Task.js';
import { Experiment } from '../Experiment.js';

function AdvanceButton() {
  const taskControls = useContext(TaskControlsContext);

  return (
    <button onClick={taskControls.advance}>Click me</button>
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

test('Task renders the correct child', () => {
  render(
    <Experiment>
      <Task id='test'>
        <TestComponent text='Hello' />
        <TestComponent text='World' />
      </Task>
    </Experiment>,
  );

  expect(screen.queryByText('Hello')).not.toBeNull();
  expect(screen.queryByText('World')).toBeNull();

  fireEvent.click(screen.getByRole('button'));

  expect(screen.queryByText('Hello')).toBeNull();
  expect(screen.queryByText('World')).not.toBeNull();
});
