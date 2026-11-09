import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { DigitalTicket } from '../types/digitalTicket';
import type { Order } from '../types/order';
import OrderCard from './OrderCard';

function ticket(id: number): DigitalTicket {
  return {
    id,
    qr_code: `codigo-${id}`,
    status: 'UNSCANNED',
    date_time_scan: null,
    id_order_item: 1,
    id_user: 1,
    createdAt: '2026-11-06T21:33:00.000Z',
    updatedAt: '2026-11-06T21:33:00.000Z',
  };
}

// Una orden pagada de dos entradas generales para un recital.
const order: Order = {
  id: 14,
  status: 'PAID',
  total: '30000.00',
  date_time_payment: '2026-11-06T21:33:00.000Z',
  payment_reference: 'SIMULADO-14-1',
  id_user: 1,
  createdAt: '2026-11-06T21:33:00.000Z',
  updatedAt: '2026-11-06T21:33:00.000Z',
  items: [
    {
      id: 1,
      quantity: 2,
      unit_price: '15000.00',
      subtotal: '30000.00',
      id_order: 14,
      id_entry: 1,
      tickets: [ticket(1), ticket(2)],
      FK_entry: {
        entry_name: 'General',
        FK_event: {
          id: 1,
          title: 'Recital de rock',
          date_time_start: '2026-12-10T23:00:00.000Z',
          FK_place: { name: 'Estadio Central', city: 'Rosario' },
        },
      },
      createdAt: '2026-11-06T21:33:00.000Z',
      updatedAt: '2026-11-06T21:33:00.000Z',
    },
  ],
};

describe('OrderCard', () => {
  it('cerrada muestra el evento, la cantidad de entradas y la orden, pero no los tickets', () => {
    render(<OrderCard order={order} />);

    const header = screen.getByRole('button', { name: /Recital de rock/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveTextContent('2 entradas · Orden #14');
    expect(screen.getByText('General · 1 de 2')).not.toBeVisible();
  });

  it('se abre y se cierra al tocar la cabecera', async () => {
    render(<OrderCard order={order} />);
    const header = screen.getByRole('button', { name: /Recital de rock/ });

    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('General · 1 de 2')).toBeVisible();

    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('con defaultOpen arranca abierta', () => {
    render(<OrderCard order={order} defaultOpen />);

    expect(screen.getByRole('button', { name: /Recital de rock/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('General · 2 de 2')).toBeVisible();
  });
});
