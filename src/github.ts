/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

interface IssueOptions {
  labels?: string
  since?: string
  sort?: string
  direction?: string
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

  private static buildOptionUrl(opts: IssueOptions): string {
    let u = ''

    if (opts.labels) {
      u += `&labels=${opts.labels}`
    }
    if (opts.direction) {
      u += `&direction=${opts.direction}`
    }
    if (opts.sort) {
      u += `&sort=${opts.sort}`
    }

    return u
  }

  public get headers(): any {
    return {
      Authorization: `token ${this.token}`
    }
  }

  public issues(repo: string, opts?: IssueOptions) {
    const defaultUrl = `${this.apiEndpoint}repos/${repo}/issues?per_page=100`
    const optionUrl = opts ? Github.buildOptionUrl(opts) : ''
    const res = UrlFetchApp.fetch(`${defaultUrl}${optionUrl}`, {
      method: 'get',
      headers: this.headers
    })

    return JSON.parse(res.getContentText())
  }
}
