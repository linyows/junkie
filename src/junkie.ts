/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

import {Github, Owner, Hook} from './github'
import {Slack} from './slack'

export interface GithubConfig {
  token: string
  apiEndpoint?: string
}

export interface SlackConfig {
  token: string
  username: string
  text: string
  iconUrl: string
}

export interface SpreadsheetsConfig {
  id: string
  url: string
}

export interface Config {
  projectUrl: string
  github: GithubConfig
  slack: SlackConfig
  spreadsheets: SpreadsheetsConfig
}

interface OwnerRepos {
  owner: string
  repos: any[]
}

interface Task {
  channel: string
  lang: string
  webhook: string
  orgs: string[]
  events: string[]
  ignore: string[]
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

  public run() {
    const channelColumn = 0
    const webhookColumn = 1
    const orgsColumn = 2
    const langColumn = 3
    const eventsColumn = 4
    const ignoreColumn = 5

    for (const task of this.data) {
      const channel = `${task[channelColumn]}`.trim()
      const orgs = Junkie.NORMALIZE(`${task[orgsColumn]}`)
      const lang = `${task[langColumn]}`.trim()
      const webhook = `${task[webhookColumn]}`.trim()
      if (orgs.length === 0 || lang === '' || lang === undefined || webhook === '' || webhook === undefined) {
        continue
      }
      const events = Junkie.NORMALIZE(`${task[eventsColumn]}`)
      const ignore = Junkie.NORMALIZE(`${task[ignoreColumn]}`)
      const t: Task = { channel, lang, orgs, webhook, events, ignore }
      this.runByLang(t)
    }
  }

  private defaultSlackParams(lang: string) {
    return {
      username: this.config.slack.username,
      icon_url: this.config.slack.iconUrl,
      link_names: 1,
      text: this.config.slack.text.replace('%s', lang)
    }
  }

  private defaultSlackAttachmentParams(owner: any) {
    const icons = [
      'nyantocat.gif',
      'daftpunktocat-thomas.gif',
      'daftpunktocat-guy.gif',
      'scarletteocat.jpg',
      'ironcat.jpg',
      'octocat-de-los-muertos.jpg',
      'megacat.jpg',
      'dojocat.jpg',
      'doctocat-brown.jpg',
      'linktocat.jpg',
      'octotron.jpg',
      'twenty-percent-cooler-octocat.png',
      'herme-t-crabb.png'
    ]
    const num = Math.floor(Math.random() * Math.floor(icons.length))

    return {
      author_name: owner.login,
      author_link: owner.html_url,
      author_icon: (this.config.github.apiEndpoint === '' || this.config.github.apiEndpoint !== 'https://api.github.com') ?
        `https://octodex.github.com/images/${icons[num]}`  : owner.avatar_url,
      footer: `<${this.config.projectUrl}|Junkie>`,
      footer_icon: this.config.slack.iconUrl
    }
  }

  private runByLang(task: Task) {
    const allRepos: OwnerRepos[] = []

    for (const owner of task.orgs) {
      const repos = this.github.reposByUserAndLang(owner, task.lang)
      allRepos.push({ owner, repos })
    }

    const newRepos: any[] = []
    const updatedRepos: any[] = []

    for (const aRepos of allRepos) {
      for (const rr of aRepos.repos) {
        const hook: Hook = this.github.findHook(rr.full_name, task.webhook)
        if (task.ignore.indexOf(rr.full_name) !== -1) {
          const m = `${rr.full_name}: ignored`
          if (hook !== undefined) {
            m += 'and hook delete'
            this.github.deleteHook(rr.full_name, hook.id)
          }
          console.log(m)
          continue
        }
        if (this.createHookIfNone(hook, rr.full_name, task)) {
          console.log(`${rr.full_name}: not found so create`)
          newRepos.push(rr)
          continue
        }
        if (this.updateHookIfDiff(hook, rr.full_name, task)) {
          console.log(`${rr.full_name}: found but has diff`)
          updatedRepos.push(rr)
          continue
        }
        console.log(`${rr.full_name}: found and same settings`)
      }
    }

    if (newRepos.length === 0 && updatedRepos.length === 0) {
      return
    }

    const attachments: any[] = []

    for (const owner of task.orgs) {
      let ownerObj: Owner

      const newRepos4Text: string[] = []
      for (const r of newRepos) {
        if (owner !== r.owner.login) {
          continue
        }
        newRepos4Text.push(`- <${r.owner.html_url}/${r.name}/settings/hooks|${r.name}>`)
        ownerObj = r.owner
      }
      if (newRepos4Text.length > 0) {
        attachments.push({
          ...this.defaultSlackAttachmentParams(ownerObj),
          ...{
            title: 'New notify settings for repositories',
            color: '#444444',
            text: newRepos4Text.join('\n')
          }
        })
      }

      const updatedRepos4Text: string[] = []
      for (const r of updatedRepos) {
        if (owner !== r.owner.login) {
          continue
        }
        updatedRepos4Text.push(`- <${r.owner.html_url}/${r.name}/settings/hooks|${r.name}>`)
        ownerObj = r.owner
      }
      if (updatedRepos4Text.length > 0) {
        attachments.push({
          ...this.defaultSlackAttachmentParams(ownerObj),
          ...{
            title: 'Updated notify settings for repositories',
            color: '#CCCCCC',
            text: updatedRepos4Text.join('\n')
          }
        })
      }
    }

    this.slack.postMessage(task.channel, {
      ...this.defaultSlackParams(task.lang),
      ...{ attachments: JSON.stringify(attachments) } })
  }

  private createHookIfNone(hook: Hook, repo: string, task: Task): boolean {
    if (hook !== undefined) {
      return false
    }
    this.github.createHook(repo, task.webhook, task.events)

    return true
  }

  private updateHookIfDiff(hook: Hook, repo: string, task: Task): boolean {
    const a = hook
      .events
      .sort()
      .toString()

    const b = task.events
      .sort()
      .toString()

    if (a === b) {
      return false
    }
    this.github.updateHookEvents(repo, hook.id, task.events)

    return true
  }
}
