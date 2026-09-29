import { Flex, Text } from '@contentful/f36-components';
import { CheckCircleIcon, ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { incompleteLabel } from '../routine';

type Props = { kind: 'done' } | { kind: 'timeout'; incomplete: number };

/** Painel que substitui a lista: "Concluído!" ou "Tempo finalizado!". */
export function FinalPanel(props: Props) {
  const done = props.kind === 'done';
  const iconStyle = { width: 160, height: 160 };
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="spacingL"
      role="status"
      style={{
        flexGrow: 1,
        borderRadius: tokens.borderRadiusMedium,
        background: done ? tokens.blue100 : tokens.orange100,
        padding: tokens.spacingL,
      }}
    >
      {done ? (
        <CheckCircleIcon color={tokens.blue600} style={iconStyle} aria-hidden />
      ) : (
        <ClockIcon color={tokens.orange500} style={iconStyle} aria-hidden />
      )}
      <Flex flexDirection="column" alignItems="center" gap="spacingXs">
        <Text as="p" fontWeight="fontWeightDemiBold" fontColor="gray900" style={{ fontSize: tokens.fontSize2Xl }}>
          {done ? 'Concluído!' : 'Tempo finalizado!'}
        </Text>
        {props.kind === 'timeout' && (
          <Text fontSize="fontSizeL" fontWeight="fontWeightDemiBold" fontColor="gray900">
            {incompleteLabel(props.incomplete)}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
