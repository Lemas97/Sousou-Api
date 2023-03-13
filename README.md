
Table of Contents
=================
* [Socket Documentation](#socket-documentation)
  * [UI's Events](#socket-documentation-ui-events)
  * [API's Events](#socket-documentation-api-events)

# Sousou-Back
Sousou's API

Copy the containing of the .env.example to .env file and fill fields.

Run:
1. `yarn install`
2. `yarn migrate`
2. `yarn dev`

Otherwise, if you use docker, run `docker-compose -f docker-compose.dev.yml up`

<a name="socket-documentation"></a>
# Socket Documentation

<a name="socket-documentation-ui-events"></a>
## UI
| Event Name     | Description                    | Response Event | Input |
| ----------- | ------------------------------ | -------- | -------- |
| 'connection'  | Checks if the authentication token is valid. If token is valid, sets User as logged and the socket joins into the proper rooms. Otherwise, automatically disconnects the socket. |'authorization'| Authorization token |
| 'message-send'| Sends message to PersonalChat or TextChannel of a shared Group.   | 'message-receive'| SendMessageInputData |
| 'message-read'| Sets on PersonalChat or TextChannel of a shared Group the last message the User has read | 'message-read'| ReadMessageInputData |
| 'message-delete'| Deletes a User's message and informs proper rooms. | 'message-deleted'| DeleteMessageInputData |
| 'disconnect'| Sets a 30 seconds timeout that can be cleared when User re-connect in time. If it hasn't been cleared, sets User as logged out and keeps the timestamp. |  | |

<a name="socket-documentation-api-events"></a>
## API
| Event Name     | Description                    | Response Type |
| ----------- | ------------------------------ | -------- |
| 'authorization' | Informs the User for the result of connection. | 'succeeded' \| 'failed' |
| 'message-receive' | Informs Users for incoming message from another User on either, PersonalChat or TextChannel of a shared Group. | PersonalChatMessage \| TextChannelMessage |
| 'message-read' | Informs Users that a User has read a message on either, PersonalChat or TextChannel of a shared Group. | PersonalChatUserPivot \| TextChannelUserPivot |
| 'message-deleted' | Informs Users that a User has deleted a message on either, PersonalChat or TextChannel of a shared Group. | TextChannelMessage \| PersonalMessage |
| 'something-changed' | On update User's details, informs friends and members of shared groups.  | User |
| 'connected-user-in-voice-channel' | Informs members of a Group that a User connected to a VoiceChannel of the Group. | VoiceChannel |
| 'disconnect-user-from-voice-channel' | Informs members of a Group that a User disconnected from a VoiceChannel of the Group. | VoiceChannel |
| 'update-group' | Informs members of a Group that the Group's info have been updated. | Group |
| 'update-text-channel' | Informs members of a Group that a TextChannel's info have been updated. | TextChannel |
| 'new-invite' | Informs a User that they have received a GroupInvite. | GroupInvite |
