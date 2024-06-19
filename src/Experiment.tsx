import { ExperimentCore } from './core.js';
import { ExperimentProps } from './core-props.js';

function Experiment(props: ExperimentProps) {
  return (
    <ExperimentCore dynamic={false} {...props}>
      {props.children}
    </ExperimentCore>
  );
}

export { Experiment };
