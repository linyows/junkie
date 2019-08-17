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

  public reposByUserAndLang(u string, l string) {
    return this.searchRepos(`+user:${u}+languages:${l}`)
  }

  public searchRepos(q string) {
    const defaultUrl = `${this.apiEndpoint}search/repositories?q=${q}&per_page=100`
    const optionUrl = opts ? Github.buildOptionUrl(opts) : ''
    const res = UrlFetchApp.fetch(`${defaultUrl}${optionUrl}`, {
      method: 'get',
      headers: this.headers
    })

    return JSON.parse(res.getContentText())
  }
}
