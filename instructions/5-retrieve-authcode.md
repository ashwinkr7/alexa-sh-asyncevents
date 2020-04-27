## Step 5: **Retrieve LWA Authorization Code**

**NOTE**: Ensure the skill endpoint logs the full request payload of incoming directives.

If the skill endpoint is an AWS Lambda function, open the corresponding log group in AWS CloudWatch and obtain the authorization code from the [AcceptGrant](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant) directive (of Alexa.Authorization interface):
![LWA authorization code in skill endpoint log](/img/Alexa.Authorization_DirectiveLoggedInCloudWatch.png "LWA authorization code in skill endpoint log")

[Previous: **Handle AcceptGrant Directive**](4-acceptgrant-handler.md)

[Next: **Build Application**](6-build-application.md)
