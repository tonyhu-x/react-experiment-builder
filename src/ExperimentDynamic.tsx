import { ExperimentCore } from './core.js';
import { Dynamic, ExperimentProps } from './core-props.js';

/**
 * Dynamic version of `<Experiment>`.
 *
 * By default, `<Experiment>` expects to know all the `<Task>`s ahead of time:
 *
 * ```tsx
 * function MyExperiment() {
 *  return (
 *    <Experiment>
 *      <MyFirstTask />
 *      <MySecondTask />
 *      ...
 *    </Experiment>
 *  );
 * }
 * ```
 *
 * However, this means that the tasks are all bundled together and loaded at once, which may
 * not be ideal for large experiments. If you are using a framework like Next.js, you can
 * instead use <ExperimentDynamic>, which expects a predefined task list and a routing function.
 * The below example uses Next.js App Router:
 *
 * ```tsx
 * // since MyExperiment uses the useRouter hook, it must be a Client Component and thus must
 * // be defined in a separate file from the root layout
 * import { useRouter } from 'next/navigation';
 *
 * export function MyExperiment({ children }: { children: React.ReactNode }) {
 *   const router = useRouter();
 *
 *   return (
 *     <ExperimentDynamic taskList={['first-task', 'second-task']} onNextTask={(taskId) => {
 *       router.push(taskId);
 *     }}>
 *       {children}
 *     </ExperimentDynamic>
 *   );
 * }
 *
 * // in app/layout.tsx
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <MyExperiment>
 *       {children}
 *     </MyExperiment>
 *   );
 * }
 * ```
 *
 * With a <ExperimentDynamic> component, you do not have to manually declare `<Task>` components.
 * <ExperimentDynamic> will automatically wrap the children in a `<Task>` component with the current
 * taskId, as defined in `taskList`.
 */
function ExperimentDynamic(props: ExperimentProps & Dynamic) {
  return (
    <ExperimentCore dynamic={true} {...props}>
      {props.children}
    </ExperimentCore>
  );
}

export { ExperimentDynamic };
