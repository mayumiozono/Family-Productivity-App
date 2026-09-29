import { Badge, Checkbox, Flex, Text } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css, cx } from '@emotion/css';
import type { MouseEvent } from 'react';
import { formatClock } from '../routine';
import type { TaskStatus } from '../routine';

type Props = {
  name: string;
  minutes: number;
  /** Prazo em minutos desde 00:00. */
  deadlineClock: number;
  status: TaskStatus;
  late: boolean;
  /** Pode ser tocado agora: a tarefa atual, ou a última concluída (para desfazer). */
  canToggle: boolean;
  onToggle: () => void;
};

const styles = {
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingS,
    padding: `${tokens.spacingXs} 0`,
    minHeight: 56,
  }),
  clickable: css({ cursor: 'pointer' }),
  // Aumenta a área de toque do Checkbox do Forma 36 e usa verde para concluído.
  checkbox: css({
    '& label': { padding: 10 },
    '& input': { width: 44, height: 44, top: 0, left: 0 },
    '& input + span': { width: 24, height: 24, borderRadius: tokens.borderRadiusSmall },
    '& input:disabled + span': { backgroundColor: tokens.colorWhite, borderColor: tokens.gray300 },
    '& input:disabled + span svg': { fill: tokens.colorWhite },
    '& input:checked + span, & input:checked:disabled + span': {
      backgroundColor: tokens.green600,
      borderColor: tokens.green600,
    },
    '& input:checked + span svg, & input:checked:disabled + span svg': { fill: tokens.colorWhite },
  }),
  current: css({ '& input + span': { borderColor: tokens.blue500, boxShadow: tokens.glowPrimary } }),
  currentLate: css({ '& input + span': { borderColor: tokens.orange500, boxShadow: tokens.glowWarning } }),
};

function Diamond({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect
        x="4"
        y="4"
        width="12"
        height="12"
        rx="1.5"
        transform="rotate(45 10 10)"
        fill={active ? tokens.blue300 : 'none'}
        stroke={active ? tokens.blue600 : tokens.gray900}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TaskRow({ name, minutes, deadlineClock, status, late, canToggle, onToggle }: Props) {
  const done = status === 'done';
  const current = status === 'current';

  // Tocar em qualquer ponto da linha da tarefa atual também marca.
  const onRowClick = (e: MouseEvent) => {
    if (!current || !canToggle) return;
    if ((e.target as HTMLElement).closest('label')) return;
    onToggle();
  };

  return (
    <div className={cx(styles.row, current && canToggle && styles.clickable)} onClick={onRowClick}>
      <Diamond active={current} />
      <Flex flexDirection="column" flexGrow={1} gap="spacing2Xs">
        <Text fontSize="fontSizeL" fontWeight="fontWeightDemiBold" fontColor={done ? 'gray400' : 'gray900'}>
          {name}
        </Text>
        <Flex alignItems="center" gap="spacingXs">
          <Text fontSize="fontSizeM" fontColor={done ? 'gray400' : 'gray600'}>
            {minutes} min · até {formatClock(deadlineClock)}
          </Text>
          {late && <Badge variant="warning">Em atraso</Badge>}
        </Flex>
      </Flex>
      <Checkbox
        className={cx(styles.checkbox, current && (late ? styles.currentLate : styles.current))}
        isChecked={done}
        isDisabled={!canToggle}
        onChange={onToggle}
        aria-label={done ? `Desmarcar ${name}` : `Marcar ${name} como feito`}
      />
    </div>
  );
}
