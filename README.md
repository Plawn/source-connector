# Source connector

Send the query using a json containing the following field for the settings params

## Settings

### Slack

channelId: Id of the slack channel
botToken: Token for the bot (should start with "xoxb")

### Trustpilot

businessUnitId: businessUnitId like in the truspilot doc
apiKey: apiKey like in the truspilot doc

### AppStore

appId: ID of the application
keyId: Id of the provided key below
key: content of the provided ".p8" by Apple

## State

The state will be sent back by API, store the state and send it back with the settings on the next call