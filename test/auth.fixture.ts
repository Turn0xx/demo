import { FastifyInstance, InjectOptions } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    login: typeof login;
    injectWithLogin: typeof injectWithLogin;
  }
}

export async function login (this: FastifyInstance, username: string) {
  const res = await this.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username,
      password: 'password123$'
    }
  })

  const cookie = res.cookies.find(
    (c) => c.name === this.config.COOKIE_NAME
  )

  if (!cookie) {
    throw new Error('Failed to retrieve session cookie.')
  }

  return cookie.value
}

export async function injectWithLogin (
  this: FastifyInstance,
  username: string,
  opts: InjectOptions
) {
  const cookieValue = await this.login(username)

  opts.cookies = {
    ...opts.cookies,
    [this.config.COOKIE_NAME]: cookieValue
  }

  return this.inject({
    ...opts
  })
}
