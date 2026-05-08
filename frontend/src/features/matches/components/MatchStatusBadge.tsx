import { Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MatchStatus } from '@/types/match';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusConfig = {
  label: string;
  variant: BadgeVariant;
};

export const STATUS_CONFIG: Record<MatchStatus, StatusConfig> = {
  SCHEDULED: { variant: 'secondary', label: 'Scheduled' },
  LOCKED: { variant: 'destructive', label: 'Locked' },
  FINISHED: { variant: 'outline', label: 'Finished' },
  SCORED: { variant: 'default', label: 'Scored' },
};

interface MatchStatusBadgeProps {
  status: MatchStatus;
  className?: string;
}

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  const { variant, label } = STATUS_CONFIG[status];

  return (
    <Badge variant={variant} className={cn('text-xs', className)}>
      {status === 'LOCKED' && <Lock className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
