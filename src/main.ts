/**
 * Junkie
 *
 * Copyright (c) 2019 Tomohisa Oda
 */

import {Junkie} from './junkie'

/**
 * Main
 */
const sheetId = PropertiesService
  .getScriptProperties()
  .getProperty('SHEET_ID')
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
//const projectUrl = 'https://github.com/linyows/junkie'

const junkie = new Junkie({
  github: {
    token: PropertiesService
     .getScriptProperties()
     .getProperty('GITHUB_ACCESS_TOKEN'),
    apiEndpoint: PropertiesService
     .getScriptProperties()
     .getProperty('GITHUB_API_ENDPOINT')
  },
  spreadsheets: {
    id: sheetId,
    url: sheetUrl
  }
})

function main() {
  junkie.run()
}
