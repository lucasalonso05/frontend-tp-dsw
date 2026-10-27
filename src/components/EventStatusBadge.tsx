import { EVENT_STATUS_LABELS } from '../types/event';
import type { EventStatus } from '../types/event';
import Badge from './Badge';
import type { BadgeTone } from './Badge';

// Verde = activo, gris = finalizado, rojo = cancelado.
const statusTones: Record<EventStatus, BadgeTone> = {
  CONFIRMED: 'green',
  FINISHED: 'slate',
  CANCELLED: 'red',
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return <Badge tone={statusTones[status]}>{EVENT_STATUS_LABELS[status]}</Badge>;
}

export default EventStatusBadge;
