import { act, render, screen } from '@testing-library/react';

import { Experiment } from './Experiment.js';
import { Task } from './Task.js';

test('Only the first task is rendered at first', async () => {
  await act(async () => {
    render(
      <Experiment>
        <Task id='test'>
          <p>Hello</p>
        </Task>
        <Task id='test2'>
          <p>World</p>
        </Task>
      </Experiment>,
    );
  });

  expect(screen.queryByText('Hello')).not.toBeNull();
  expect(screen.queryByText('World')).toBeNull();
});
