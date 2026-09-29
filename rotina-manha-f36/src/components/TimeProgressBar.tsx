import tokens from '@contentful/f36-tokens';
import { DURATION_MINUTES } from '../data';

type Props = {
  /** Minutos simulados desde o início. */
  elapsed: number;
  warning: boolean;
  label: string;
};

/** Barra de passagem do tempo entre o início da rotina e o horário de saída. */
export function TimeProgressBar({ elapsed, warning, label }: Props) {
  const percent = Math.min(100, (elapsed / DURATION_MINUTES) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={label}
      style={{
        width: '100%',
        height: 16,
        borderRadius: 999,
        background: tokens.gray300,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          borderRadius: 999,
          background: warning ? tokens.orange500 : tokens.blue600,
          transition: `background-color ${tokens.transitionDurationDefault} ${tokens.transitionEasingDefault}`,
        }}
      />
    </div>
  );
}
