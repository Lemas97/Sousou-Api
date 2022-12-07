import { FilterQuery } from '@mikro-orm/core'
import { User } from '../..//types/entities/User'

export function usersSearchFilter (stringFilter?: string): FilterQuery<User> {
  const filter: FilterQuery<User> = {
    $or: [
      stringFilter
        ? {
            $or: [
              { displayName: { $like: `%${stringFilter}%` } },
              { email: { $like: `%${stringFilter}%` } },
              { username: { $like: `%${stringFilter}%` } }
            ]
          }
        : {}
    ]
  }

  return filter
}
