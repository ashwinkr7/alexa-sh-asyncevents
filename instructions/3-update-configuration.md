## Step 3: **Update Configuration**

Open the [config.json](/config.json) file in any text editor, and copy the **Client ID** and **Client Secret**, obtained in the [previous step](2-skill-permissions.md), into the _client_id_ and _client_secret_ properties respectively.


| Key | Value | Comments |
| --- | --- | --- |
| **lwaProfileEndpoint** | `https://api.amazon.com/user/profile` | LWA user profile endpoint |
| **lwaTokenEndpoint** | `https://api.amazon.com/auth/o2/token` | LWA token endpoint |
| **alexaInboundGatewayEndpoint** | `https://api.amazonalexa.com/v3/events` | Alexa event gateway for sending async events<br />_North America:_ `https://api.amazonalexa.com/v3/events`<br />_Europe:_ `https://api.eu.amazonalexa.com/v3/events`<br />_Far East:_ `https://api.fe.amazonalexa.com/v3/events` |
| **client_id** | ` ` | Copy Client ID obtained in previous step, when the skill's Permissions is enabled |
| **client_secret** | ` ` | Copy Client Secret obtained in previous step, when the skill's Permissions is enabled |
| **refresh_token** | ` ` | Automatically generated when _LWA authorization code_ is exchanged for OAuth2 tokens with this application |
| **refresh_token** | ` ` | Automatically generated when _LWA authorization code_ is exchanged for OAuth2 tokens with this application |

[Previous: **Update Skill Permissions**](2-skill-permissions.md)

[Next: **Handle AcceptGrant Directive**](4-acceptgrant-handler.md)

