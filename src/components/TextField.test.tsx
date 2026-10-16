import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TextField from './TextField'

describe('TextField', () => {
  it('muestra la etiqueta asociada al campo', () => {
    render(<TextField label="Nombre" name="name" value="" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
  })

  it('avisa cada cambio con el nombre del campo y el valor nuevo', async () => {
    const handleChange = vi.fn()
    render(<TextField label="Nombre" name="name" value="" onChange={handleChange} />)

    await userEvent.type(screen.getByLabelText('Nombre'), 'A')

    expect(handleChange).toHaveBeenCalledWith('name', 'A')
  })

  it('muestra el error y marca el campo como inválido', () => {
    render(
      <TextField
        label="Nombre"
        name="name"
        value=""
        error="Este campo es obligatorio"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true')
  })
})