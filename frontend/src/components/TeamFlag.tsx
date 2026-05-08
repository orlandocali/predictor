import { getTeamFlagUrl } from '@/lib/teamFlags';

interface TeamFlagProps {
  team: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_MAP = {
  sm: { width: 20 as const, imgWidth: 20, imgHeight: 15 },
  md: { width: 40 as const, imgWidth: 28, imgHeight: 21 },
};

export default function TeamFlag({ team, size = 'sm', className }: TeamFlagProps) {
  const { width, imgWidth, imgHeight } = SIZE_MAP[size];
  const url = getTeamFlagUrl(team, width);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={`${team} flag`}
      width={imgWidth}
      height={imgHeight}
      loading="lazy"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    />
  );
}
