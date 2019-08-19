<p align="center">
  <img width="400" src="https://raw.githubusercontent.com/linyows/junkie/master/misc/junkie-logo.png"> <br><br>
  <strong>Junkie</strong> notifies pull-request to Slack channel that for specified a language.
</p>

<p align="center">
<a href="https://travis-ci.org/linyows/junkie" title="travis"><img src="https://img.shields.io/travis/linyows/junkie.svg?style=for-the-badge"></a>
<a href="https://github.com/google/clasp" title="clasp"><img src="https://img.shields.io/badge/built%20with-clasp-4285f4.svg?style=for-the-badge"></a>
<a href="https://github.com/linyows/junkie/blob/master/LICENSE" title="MIT License"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge"></a>
</p>

Usage
-----

1. Deploy this
    ```sh
    $ npm i
    $ npx clasp login
    $ npx clasp create 'Junkie' --rootDir ./src
    $ npx clasp push
    ```
1. Create google spreadsheet. For example:

    Lang | Channel |  Hooks
    ---  | ---     |  ---
    go   | gopher  |  
    ruby | rubyist |  
    php  | phper   |  
1. Set script properties as ENV(File > Project properties > Script properties)
    - SLACK_ACCESS_TOKEN
    - GITHUB_ACCESS_TOKEN
    - GITHUB_API_ENDPOINT(optional)
1. Add project trigger(Edit > Current project's triggers > Add trigger)
    - Choose which function to run: `notify`
    - Which run at deployment: `head`
    - Select event source: `Time-driven`
    - Select type of time based trigger: `Minute timer`
    - Select hour interval: `Every minute`

Contribution
------------

1. Fork (https://github.com/linyows/junkie/fork)
1. Create a feature branch
1. Commit your changes
1. Rebase your local changes against the master branch
1. Run test suite with the `npm ci` command and confirm that it passes
1. Create a new Pull Request

Author
------

[linyows](https://github.com/linyows)
