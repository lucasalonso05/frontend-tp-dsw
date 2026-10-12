import type { CreateEntryDTO, Entry, UpdateEntryDTO } from '../types/entry'
import { CrudService } from './CrudService'

class EntryService extends CrudService<Entry, CreateEntryDTO, UpdateEntryDTO> {
  constructor() {
    super('/entries')
  }

  /** El backend no filtra por evento: se piden todas y se filtra acá. */
  async getByEvent(idEvent: number): Promise<Entry[]> {
    const entries = await this.getAll()
    return entries.filter((entry) => entry.id_event === idEvent)
  }
}

export const entryService = new EntryService()