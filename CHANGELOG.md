## CHANGELOG
### v1.0.44
- add language api
  - `handlers.language`: set your language
  - `handlers.languageOption`:
    > when set this value, should set `handlers.language` to `null`

    - set your own language option, like `src/language/en/index.js`

### v1.1.0
- remove `api` in export api
  - change to
  - all system own api start with  `$`, such as `axiosPro.$util`
