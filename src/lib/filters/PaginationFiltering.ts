import { FindOptions } from '@mikro-orm/core'
import { PaginatedInputData } from '../..//types/classes/input-data/PaginatedInputData'

export function paginationFiltering<T> (paginationData: PaginatedInputData): FindOptions<T> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  return {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset
  }
}
