/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

import {Github} from './github'
import {Slack} from './slack'

interface GithubConfig {
  token: string
  apiEndpoint?: string
}

interface SlackConfig {
  token: string
  username: string
  textSuffix: string
  textEmpty: string
  textDefault: string
}

interface SpreadsheetsConfig {
  id: string
  url: string
}

interface Config {
  github: GithubConfig
  spreadsheets: SpreadsheetsConfig
}

export class Junkie {
  private get slack(): any {
    if (this.pSlack === undefined) {
      this.pSlack = new Slack(this.config.slack.token)
    }

    return this.pSlack
  }

  private get github(): any {
    if (this.pGithub === undefined) {
      if (this.config.github.apiEndpoint) {
        this.pGithub = new Github(this.config.github.token, this.config.github.apiEndpoint)
      } else {
        this.pGithub = new Github(this.config.github.token)
      }
    }

    return this.pGithub
  }

  private get sheet(): any {
    if (this.pSheet === undefined) {
      const s = SpreadsheetApp.openById(this.config.spreadsheets.id)
      this.pSheet = s.getSheetByName('config')
    }

    return this.pSheet
  }

  private get data(): any {
    if (this.pData === undefined) {
      const startRow = 2
      const startColumn = 1
      const numRow = this.sheet.getLastRow()
      const numColumn = this.sheet.getLastColumn()
      this.pData = this.sheet.getSheetValues(startRow, startColumn, numRow, numColumn)
    }

    return this.pData
  }

  public config: Config
  private pSheet: any
  private pSlack: any
  private pGithub: any
  private pData: any

  constructor(c: Config) {
    this.config = c
  }

  public static NORMALIZE(str: string): string[] {
    const arr = str.split('\n')
    for (let v of arr) {
      v = v.trim()
    }

    return arr.filter((v) => v)
  }

  private runByLang(lang: string, orgs: string[], webhook: string, events: string[]) {
    let repos: string[] = []
    for (const org of orgs) {
      const langRepos = this.github.reposByUserAndLang(org, lang)
      for (const r of langRepos) {
        repos.push(r.full_name)
      }
    }

    for (const r of repos) {
      const hook = this.github.findHook(r, webhook)
      if (hook === undefined) {
        this.github.createHook(r, webhook, events)
        continue
      }
      if (hook.events.sort().toString() !== events.sort().toString()) {
        this.github.updateHookEvents(r, hook.id, events)
        continue
      }
      console.log('found but same!!!!!!!!!!!!!!!!!')
    }
  }

  public run() {
    const channelColumn = 0
    const webhookColumn = 1
    const orgsColumn = 2
    const langColumn = 3
    const eventsColumn = 4

    for (const task of this.data) {
      const orgs = Junkie.NORMALIZE(`${task[orgsColumn]}`)
      const lang = `${task[langColumn]}`.trim()
      const webhook = `${task[webhookColumn]}`.trim()
      if (orgs.length === 0 || lang === '' || lang === undefined || webhook === '' || webhook === undefined) {
        continue
      }
      const events = Junkie.NORMALIZE(`${task[eventsColumn]}`)
      this.runByLang(lang, orgs, webhook, events)
    }
  }
}
