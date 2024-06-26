import { ExperimentImpl } from './core.js';
import { ExperimentProps } from './core-props.js';

function Experiment(props: ExperimentProps) {
  return (
    <ExperimentImpl dynamic={false} {...props}>
      {props.children}
    </ExperimentImpl>
  );
}

export { Experiment };
