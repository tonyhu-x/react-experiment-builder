import { ExperimentCore, ExperimentProps } from './core.js';

function Experiment(props: ExperimentProps) {
  return (
    <ExperimentCore dynamic={false} {...props}>
      {props.children}
    </ExperimentCore>
  );
}

export { Experiment };
