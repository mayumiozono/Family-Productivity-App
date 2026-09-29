import { Box, Button, ButtonGroup, Flex, Grid, Header, Text } from '@contentful/f36-components';
import { ArrowCounterClockwiseIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { useState, type MouseEvent } from 'react';
import { TimeProgressBar } from './components/TimeProgressBar';
import { PersonColumn } from './components/PersonColumn';
import { DURATION_MINUTES, PEOPLE, START_MINUTES } from './data';
import { clockLabel, formatClock, isWarning, remainingLabel } from './routine';
import { useSimulatedClock } from './useSimulatedClock';

const initialDone = () => Object.fromEntries(PEOPLE.map((p) => [p.id, 0])) as Record<string, number>;

// Sem navegação no MVP: o breadcrumb é só visual.
const noNavigation = (e: MouseEvent) => e.preventDefault();

const bigTime = { fontSize: 40, lineHeight: 1.1, margin: 0 };

export function App() {
  const clock = useSimulatedClock();
  const [done, setDone] = useState(initialDone);
  const warning = isWarning(clock.elapsed);
  const centerLabel = clock.ended ? 'Hora de sair!' : `Restam ${remainingLabel(clock.elapsed)}`;

  const reset = () => {
    clock.reset();
    setDone(initialDone());
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: tokens.gray100,
        padding: `${tokens.spacingM} ${tokens.spacingXl} ${tokens.spacingXl}`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Header
        breadcrumbs={[{ content: 'Rotina', url: '#', onClick: noNavigation }]}
        title="Rotina da manhã"
        style={{ background: 'transparent', borderBottom: `1px solid ${tokens.gray300}`, paddingLeft: 0, paddingRight: 0 }}
        actions={
          <ButtonGroup variant="spaced" spacing="spacingS">
            <Button variant="primary" onClick={clock.toggle} isDisabled={clock.ended} style={{ minWidth: 120 }}>
              {clock.running ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button variant="secondary" startIcon={<ArrowCounterClockwiseIcon />} onClick={reset}>
              Reiniciar
            </Button>
          </ButtonGroup>
        }
      />

      <Flex alignItems="flex-end" gap="spacing2Xl" style={{ margin: `${tokens.spacing2Xl} 0 ${tokens.spacingXl}` }}>
        <Flex flexDirection="column" gap="spacing2Xs">
          <Text fontColor="gray900">Horário atual</Text>
          <Text as="p" fontWeight="fontWeightDemiBold" fontColor="gray900" style={bigTime}>
            {clockLabel(clock.elapsed)}
          </Text>
        </Flex>
        <Flex flexDirection="column" alignItems="center" gap="spacingS" flexGrow={1} style={{ paddingBottom: 6 }}>
          <Text as="p" fontWeight="fontWeightDemiBold" fontColor="gray900" style={{ fontSize: 36, lineHeight: 1.1 }}>
            {centerLabel}
          </Text>
          <TimeProgressBar elapsed={clock.elapsed} warning={warning} label={centerLabel} />
        </Flex>
        <Flex flexDirection="column" alignItems="flex-end" gap="spacing2Xs">
          <Text fontColor="gray900">Horário de saída</Text>
          <Text as="p" fontWeight="fontWeightDemiBold" fontColor={clock.ended ? 'blue600' : 'gray900'} style={bigTime}>
            {formatClock(START_MINUTES + DURATION_MINUTES)}
          </Text>
        </Flex>
      </Flex>

      <Grid columns="repeat(3, 1fr)" columnGap="spacingM" style={{ flexGrow: 1 }}>
        {PEOPLE.map((person) => (
          <PersonColumn
            key={person.id}
            person={person}
            doneCount={done[person.id]}
            elapsed={clock.elapsed}
            ended={clock.ended}
            onDoneCountChange={(n) => setDone((d) => ({ ...d, [person.id]: n }))}
          />
        ))}
      </Grid>
    </Box>
  );
}
