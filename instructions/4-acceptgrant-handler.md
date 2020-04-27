## Step 4: **Handle AcceptGrant Directive** (in the skill endpoint)

When the skill is enabled and account linking is successful, Alexa will send an [AcceptGrant](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant) directive ([Alexa.Authorization](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html) interface). This directive must be handled appropriately, eventually yielding OAuth2 tokens in exchange for the authorization code embedded in the directive payload. You can use this application to obtain tokens using the authorization code included in the directive.

The following code samples illustrate the response that must be sent back to Alexa.

**Python**
```python
import logging
import uuid
import json
...
request_namespace = request["directive"]["header"]["namespace"]
if request_namespace == "Alexa.Authorization":
    logger.info("Received [%s] directive => %s" % (request_namespace, json.dumps(request, indent=4, sort_keys=True)))
    ...
    response = {
        "event": {
            "header": {
                "messageId": get_uuid(),
                "namespace": "Alexa.Authorization",
                "name": "AcceptGrant.Response",
                "payloadVersion": "3"
            },
            "payload": {}
        }
    }
    return response
```

**Node.js**
```javascript
const uuid = require('uuid');
...
let namespace = ((event.directive || {}).header || {}).namespace;
if (namespace.toLowerCase() === 'alexa.authorization') {
    let aar = new AlexaResponse({"namespace": "Alexa.Authorization", "name": "AcceptGrant.Response",});
    let response = {
        "event": {
            "header": {
                "message_id": uuid(),
                "namespace": "Alexa.Authorization",
                "name": "AcceptGrant.Response",
                "payloadVersion": "3"
            },
            "payload": {}
        }        
    }
    return response;
```

[Previous: **Update Configuration**](3-update-configuration.md)

[Next: **Build Application**](5-build-application.md)

