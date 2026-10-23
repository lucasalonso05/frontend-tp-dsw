import { EVENT_STATUS_LABELS } from '../types/event';
import type { EventStatus } from '../types/event';

const statusClasses: Record<EventStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  FINISHED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${statusClasses[status]}`}>
      {EVENT_STATUS_LABELS[status]}
    </span>
  );
}

export default EventStatusBadge;
