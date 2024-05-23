import { useEffect, useState } from 'react';

type ExperimentProps = {
  genUserId?: () => Promise<string>;
  children: React.ReactNode;
};

// export const ExperimentContext = createContext()
//
const CHAR_SET = '123456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Code taken from https://dev.to/munawwar/shorter-unique-ids-4316.
 */
function genUserIdDefault() {
  return 'x'
    .repeat(11)
    .replace(/x/g, () => CHAR_SET[Math.trunc(Math.random() * 32)]);
}

export function Experiment(props: ExperimentProps) {
  // valid user ID must not be empty
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (userId == '') {
      if (props.genUserId) {
        props.genUserId()
          .then((id) => {
            setUserId(id);
          });
      }
      else {
        setUserId(genUserIdDefault());
      }
    }
  }, []);

  return (
    <p>{userId}</p>
  );
};
