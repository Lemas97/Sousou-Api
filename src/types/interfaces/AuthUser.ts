export interface AuthUser {
  sub: string

  azp: string

  resource_access: {
    [key: string]: {
      roles: string[]
    }
  }

  scope: string

  email: string

  name: string

  preferred_username: string
}
