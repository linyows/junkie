/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

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
    const res = this.searchRepos(`+language:${l}+user:${u}`)

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

  public findHook(repo: string, webhook: string) {
    const hooks = this.repoHooks(repo)
    for (const h of hooks) {
      if (h.active && h.config.url === webhook) {
        return h
      }
    }
  }

  public createHook(repo: string, webhook: string, events: string[]) {
  console.log(`${repo} : create hook!!!!!!!!!!!!!!!!!!!!!!!!`)
    // const res = UrlFetchApp.fetch(`${this.apiEndpoint}/repos/${repo}/hooks`, {
    //   method: 'post',
    //   headers: this.headers,
    //   payload: {
    //     config: { url: webhook },
    //     events: events
    //   }
    // })

    // return JSON.parse(res.getContentText())
  }

  public updateHookEvents(repo: string, id: number, events: string[]) {
  console.log(`${repo} : update hook-----------------------`)
    // const res = UrlFetchApp.fetch(`${this.apiEndpoint}/repos/${repo}/hooks/${id}`, {
    //   method: 'post',
    //   headers: this.headers,
    //   payload: {
    //     events: events
    //   }
    // })

    // return JSON.parse(res.getContentText())
  }
}
