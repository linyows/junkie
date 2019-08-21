/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

export interface Owner {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  site_admin: boolean
}

export interface HookLastResponse {
  code: number
  status: string
  message: string
}

export interface HookConfig {
  content_type: string
  insecure_ssl: string
  url: string
}

export interface Hook {
  id: number
  name: string
  active: boolean
  events: string[]
  config: HookConfig
  updated_at: string
  created_at: string
  url: string
  test_url: string
  ping_url: string
  last_response: HookLastResponse
}

/**
 * Github Client
 */
export class Github {
  private token: string
  private apiEndpoint: string

  constructor(token: string, apiEndpoint?: string) {
    this.token = token
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint
    } else {
      this.apiEndpoint = 'https://api.github.com/'
    }
  }

  public get headers(): any {
    return {
      Authorization: `token ${this.token}`
    }
  }

  public reposByUserAndLang(u: string, l: string) {
    const res = this.searchRepos(`+language:${l}+user:${u}+archived:false`)

    return (res.items.length > 0) ? res.items : []
  }

  public searchRepos(q: string) {
    const defaultUrl = `${this.apiEndpoint}search/repositories?q=${q}&per_page=100`
    const res = UrlFetchApp.fetch(`${defaultUrl}`, {
      method: 'get',
      headers: this.headers
    })

    return JSON.parse(res.getContentText())
  }

  public repoHooks(repo: string) {
    const defaultUrl = `${this.apiEndpoint}repos/${repo}/hooks`
    const res = UrlFetchApp.fetch(`${defaultUrl}`, {
      method: 'get',
      headers: this.headers
    })

    return JSON.parse(res.getContentText())
  }

  public findHook(repo: string, webhook: string): Hook|null {
    const hooks = this.repoHooks(repo)
    for (const h of hooks) {
      if (h.active && h.config.url === webhook) {
        return h
      }
    }
  }

  public createHook(repo: string, webhook: string, events: string[]) {
    const res = UrlFetchApp.fetch(`${this.apiEndpoint}repos/${repo}/hooks`, {
      method: 'post',
      headers: this.headers,
      payload: JSON.stringify({
        config: { url: webhook },
        events: events
      })
    })

    return JSON.parse(res.getContentText())
  }

  public updateHookEvents(repo: string, id: number, events: string[]) {
    const res = UrlFetchApp.fetch(`${this.apiEndpoint}repos/${repo}/hooks/${id}`, {
      method: 'post',
      headers: this.headers,
      payload: JSON.stringify({
        events: events
      })
    })

    return JSON.parse(res.getContentText())
  }

  public deleteHook(repo: string, id: number): boolean {
    const res = UrlFetchApp.fetch(`${this.apiEndpoint}repos/${repo}/hooks/${id}`, {
      method: 'delete',
      headers: this.headers
    })

    return true
  }
}
