export const AUTH_TOKEN_KEY = 'kelldev-auth-token'

interface JwtPayload {
  exp?: number
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const payloadSegment = token.split('.')[1]

  if (!payloadSegment) return null

  try {
    const base64 = payloadSegment
      .replace(
        /-/g,
        '+'
      )
      .replace(
        /_/g,
        '/'
      )

    return JSON.parse(window.atob(base64))
  } catch {
    return null
  }
}

export const getAuthToken = (): string | null => {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export const setAuthToken = (token: string): void => {
  try {
    window.localStorage.setItem(
      AUTH_TOKEN_KEY,
      token
    )
  } catch {
    /* storage unavailable */
  }
}

export const clearAuthToken = (): void => {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false

  const payload = decodeJwtPayload(token)

  if (!payload || typeof payload.exp !== 'number') return false

  return payload.exp * 1000 > Date.now()
}

export const hasValidAuthToken = (): boolean => isTokenValid(getAuthToken())
