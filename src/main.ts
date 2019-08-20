/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

import {Junkie, GithubConfig, SlackConfig, SpreadsheetsConfig, Config} from './junkie'

/**
 * Main
 */
const id = PropertiesService
  .getScriptProperties()
  .getProperty('SHEET_ID')
const url = `https://docs.google.com/spreadsheets/d/${id}/edit`
const projectUrl = 'https://github.com/linyows/junkie'
const github: GithubConfig = {
  token: PropertiesService
   .getScriptProperties()
   .getProperty('GITHUB_ACCESS_TOKEN'),
  apiEndpoint: PropertiesService
   .getScriptProperties()
   .getProperty('GITHUB_API_ENDPOINT')
}
const slack: SlackConfig = {
  token: PropertiesService
    .getScriptProperties()
    .getProperty('SLACK_ACCESS_TOKEN'),
  username: 'Junkie',
  text: `Hey, %s Junkies! :point_down: -- <${url}|Settings> | <${projectUrl}|About>`,
  iconUrl: 'https://raw.githubusercontent.com/linyows/junkie/master/misc/junkie-icon.png'
}
const spreadsheets: SpreadsheetsConfig = { id, url }
const config: Config = { projectUrl, github, slack, spreadsheets }
const junkie = new Junkie(config)

function main() {
  junkie.run()
}
