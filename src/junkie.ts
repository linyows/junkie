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
