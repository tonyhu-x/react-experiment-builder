import { act, render, screen } from '@testing-library/react';

import { Experiment } from './Experiment.js';

test('Login component is rendered', async () => {
  await act(async () => {
    render(
      <Experiment loginOptions={{
        loginType: 'login',
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
        loginType: 'login',
        loginComponent: <p>Hello</p>,
      }}
      >
        <p>World</p>
      </Experiment>,
    );
  });
  expect(screen.queryByText('Hello')).not.toBeNull();
});
