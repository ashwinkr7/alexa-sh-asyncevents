# alexa-sh-asyncclient
Node.js based CLI utility for sending events asynchronously to the Alexa Event Gateway.

This application facilitates the following actions, via a convenient command-line interface, associated with an Alexa Smart Home or Video skill for third-party connected devices:
* Exchange Login with Amazon authorization code for OAuth2 tokens (refresh and bearer tokens)
* Refresh LWA OAuth2 tokens
* Send asynchronous events to the Alexa event gateway; e.g. [addOrUpdateReport](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#add-or-update-report) (Proactive Endpoint Management) and [changeReport](https://developer.amazon.com/en-US/docs/alexa/smarthome/state-reporting-for-a-smart-home-skill.html#report-state-with-changereport-events) (Proactive State Update).


## Instructions
1. [Prerequisites](/instructions/1-prerequisites.md)
2. [Update Skill Permissions](/instructions/2-skill-permissions.md)
3. [Update Configuration](/instructions/3-update-configuration.md)
4. [Handle AcceptGrant Directive](/instructions/4-acceptgrant-handler.md)
5. [Build Application](/instructions/5-build-application.md)

## Usage
To start the application, run the following command:
```
npm start
```
![Run application](/img/runapp.gif "Run application")

### **Exchange LWA Authorization Code for OAuth2 Tokens**

**NOTE**: Ensure the skill endpoint logs the full request payload of incoming directives.

Enable the skill in the Alexa companion app. Once account linking is completed successfully, an `AcceptGrant` directive (`Alexa.Authorization` interface) is sent to the skill endpoint. This directive will contain an LWA authorization code.

If the skill endpoint is an AWS Lambda function, open the corresponding log group in AWS CloudWatch and obtain the authorization code from the [AcceptGrant](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant) directive (of Alexa.Authorization interface):
![LWA authorization code in skill endpoint log](/img/Alexa.Authorization_DirectiveLoggedInCloudWatch.png "LWA authorization code in skill endpoint log")

Enter this code when prompted. The application will call LWA's Token service API with this code to receive OAuth2 tokens, i.e. _Refresh_ and _Access_ (or _Bearer_) tokens. These tokens will automatically be persisted in the application's [config.json](/config.json) file.

![Exchange authorization code for OAuth2 tokens](/img/authcode.gif "Exchange authorization code for OAuth2 tokens")

### **Check Validity of LWA Access Token**

This is used to ascertain the validity of the _Access_ token (obtained in the [previous step](#exchange-lwa-authorization-code-for-oauth2-tokens)), i.e. to determine if it is still valid or has expired. If the token has expired, the [Refresh LWA Access Token](#refresh-lwa-access-token) option can be invoked to receive a new _Access_ token.

### **Refresh LWA Access Token**

If the _Access_ token has expired, it can be refreshed by calling the LWA Token service API. The _Refresh_ token is used to request a new _Access_ token. The API response will contain both the _Refresh_ and _Access_ tokens, which will automatically be persisted in the application's [config.json](/config.json) file.

### **Send addOrUpdateReport**

Once the skill is enabled and the connected device is discovered, the endpoint can be modified by sending an [addOrUpdateReport](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#add-or-update-report) event to Alexa.

A sample JSON file [addOrUpdateReport.json](/addOrUpdateReport.json) is provided. It can be modified using any text editor. When this option is invoked, the application loads the contents of the JSON file, updates the in-memory copy with the _Access_ (or _Bearer_) token and sends the payload via a POST request to the Alexa Event Gateway.

### **Send addOrUpdateReport**

Once the skill is enabled and the connected device is discovered, the endpoint can be modified by sending an [addOrUpdateReport](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#add-or-update-report) event to Alexa.

A sample JSON file [addOrUpdateReport.json](/addOrUpdateReport.json) is provided. It can be modified using any text editor. When this option is invoked, the application loads the contents of the JSON file, updates the in-memory copy with the _Access_ (or _Bearer_) token and sends the payload via a POST request to the Alexa Event Gateway.

### **Send changeReport**

The state of the connected device can be updated either with physical interaction, interaction with Alexa, or other means. When the state changes without involving Alexa, a [changeReport](https://developer.amazon.com/en-US/docs/alexa/smarthome/state-reporting-for-a-smart-home-skill.html#report-state-with-changereport-events) event must be sent to notify Alexa of the change in state. This is also known as _Proactive State Updates_ (or PSU).

A sample JSON file [changeReport.json](/changeReport.json) is provided. It can be modified using any text editor. When this option is invoked, the application loads the contents of the JSON file, updates the in-memory copy with the _Access_ (or _Bearer_) token and timestamps associated with the state changes, and sends the payload via a POST request to the Alexa Event Gateway.

### **Send Alexa Response**

The skill endpoint must respond to control directives with [Alexa.Response](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-response.html) if the control command was successfully executed, or even to just acknowledge that the control command was received and forwarded on to the connected device. If the skill endpoint is unable to respond synchronously before the request is timed out by Alexa (within an 8-second threshold period), it is recommended that the skill endpoint first respond with an [Alexa.DeferredResponse](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-response.html#deferred), followed by an asynchronous [Alexa.Response](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-response.html#asynchronous).

A sample JSON file [asyncAlexaResponse.json](/asyncAlexaResponse.json) is provided. It can be modified using any text editor. When this option is invoked, the application first prompts for a _correlation token_ (received in the directive). Then, the application loads the contents of the JSON file, updates the in-memory copy with the _Access_ (or _Bearer_) token, and the correlation token, and sends the payload via a POST request to the Alexa Event Gateway.
