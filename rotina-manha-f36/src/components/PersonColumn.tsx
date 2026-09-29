import { Card, Flex, Heading, Text } from '@contentful/f36-components';
import { START_MINUTES, type Person } from '../data';
import { deadlines, isLate, stepsLeftLabel, taskStatus } from '../routine';
import { FinalPanel } from './FinalPanel';
import { TaskRow } from './TaskRow';

type Props = {
  person: Person;
  doneCount: number;
  elapsed: number;
  ended: boolean;
  onDoneCountChange: (n: number) => void;
};

export function PersonColumn({ person, doneCount, elapsed, ended, onDoneCountChange }: Props) {
  const total = person.tasks.length;
  const left = total - doneCount;
  const due = deadlines(person.tasks);
  const finished = left === 0;

  return (
    <Card padding="large" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Flex flexDirection="column" style={{ height: '100%' }}>
        <Heading as="h2" marginBottom="spacingXs" style={{ fontSize: 22 }}>
          {person.name}
        </Heading>
        <Text fontColor="gray700" marginBottom="spacingM">
          {stepsLeftLabel(left)}
        </Text>

        {finished ? (
          <FinalPanel kind="done" />
        ) : ended ? (
          <FinalPanel kind="timeout" incomplete={left} />
        ) : (
          <Flex flexDirection="column">
            {person.tasks.map((task, i) => {
              const status = taskStatus(i, doneCount);
              const isUndo = i === doneCount - 1;
              return (
                <TaskRow
                  key={task.name}
                  name={task.name}
                  minutes={task.minutes}
                  deadlineClock={START_MINUTES + due[i]}
                  status={status}
                  late={isLate(i, doneCount, due[i], elapsed)}
                  canToggle={status === 'current' || isUndo}
                  onToggle={() => onDoneCountChange(isUndo ? doneCount - 1 : doneCount + 1)}
                />
              );
            })}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
