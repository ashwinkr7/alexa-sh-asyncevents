"use strict";

const fs = require('fs')
const request = require('request')
const util = require('util')
const dateFormat = require('dateformat')
const { uuid } = require('uuidv4')
const config = require('./config.json')

/*-------
   Exchange authorization code received in Alexa.AcceptGrant directive for
   LWA OAuth2 tokens.
  -------*/
const fnExchangeAuthCodeForTokens = (authCode) => {
  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept-Charset": "utf-8"
  };

  let params = {
    "grant_type": "authorization_code",
    "code": authCode,
    "client_id": config.client_id,
    "client_secret": config.client_secret
  };

  let options = {
    url: config.lwaTokenEndpoint,
    method: "POST",
    headers: headers,
    form: params,
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      // console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        config.access_token = body.access_token;
        config.refresh_token = body.refresh_token;
        fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
        console.info(`Tokens generated successfully (expires in ${body.expires_in / 60} mins)`)
        resolve(body);
      }
      else {
        reject(`${response.body.error} (${response.body.error_description})`);
      }
    });
  });
}

/*-------
   Assess access token validity by using access token to fetch the customer profile
   LWA tokens don't have the required scope to fetch customer profile, so just
   look for error response of 'insufficient scope' and interpret that as valid
   tokens. 
  -------*/
const fnCheckTokenValidity = () => {
  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Accept": "application/json",
    "Accept-Charset": "utf-8",
    "Authorization": "Bearer " + config.access_token
  };

  let options = {
    url: config.lwaProfileEndpoint,
    method: "GET",
    headers: headers
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      //console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve(body);
      }
      else {
        let tokenError = JSON.parse(response.body).error;
        if (tokenError === 'insufficient_scope') {
          resolve('Token is valid');
        }
        else {
          reject(tokenError);
        }
      }
    });
  });
};


/*-------
   Refresh OAuth2 tokens, using the refresh token previously received
  -------*/
const fnRefreshOAuth2Tokens = () => {
  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  let params = {
    "grant_type": "refresh_token",
    "refresh_token": config.refresh_token,
    "client_id": config.client_id,
    "client_secret": config.client_secret
  };

  let options = {
    url: config.lwaTokenEndpoint,
    method: "POST",
    headers: headers,
    form: params,
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      // console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        config.access_token = body.access_token;
        config.refresh_token = body.refresh_token;
        fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
        resolve(body);
      }
      else {
        reject(`${response.body.error} (${response.body.error_description})`);
      }
    });
  });
};

/*-------
   Send proactive addOrUpdateReport event for proactive discovery
  -------*/
const fnSendAddOrUpdateReport = () => {

  let fileData = fs.readFileSync('addOrUpdateReport.json');
  let jsonPayload = JSON.parse(fileData); 
  jsonPayload.event.header.messageId = uuid();
  jsonPayload.event.payload.scope.token = config.access_token;

  //console.info(util.inspect(jsonPayload, { showHidden: false, depth: null }));

  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Content-Type": "application/json",
    "Content-Length": jsonPayload.length,
    "Accept-Charset": "utf-8",
    "Authorization": "Bearer " + config.access_token
  };

  let options = {
    url: config.alexaInboundGatewayEndpoint,
    method: "POST",
    headers: headers,
    json: jsonPayload
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      //console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.statusCode === 202) {
          resolve("addOrUpdateReport PSU sent successfully!");
        }
        else {
          resolve(body);
        }
      }
      else {
        reject(response.body.payload.description);
      }
    });
  });
};

/*-------
   Send proactive changeReport event for state change
  -------*/
const fnSendChangeReport = (data) => {
  let fileData = fs.readFileSync('changeReport.json');
  let jsonPayload = JSON.parse(fileData);
  // Assign an uuid for message ID
  jsonPayload.event.header.messageId = uuid();
  // Set token field to access token from config 
  jsonPayload.event.endpoint.scope.token = config.access_token;
  // Instantiate a new Date object for current time, to update timeOfSample properties in payload
  let dateObj = new Date();
  // Update timeOfSample of properties shared in context
  jsonPayload.context.properties.forEach((property) => {
    property.timeOfSample = dateFormat(dateObj, "UTC:yyyy-mm-dd'T'HH:MM:ss.L'Z'");
  });
  // Update timeOfSample of properties shared in change
  jsonPayload.event.payload.change.properties.forEach((property) => {
    property.timeOfSample = dateFormat(dateObj, "UTC:yyyy-mm-dd'T'HH:MM:ss.L'Z'");
  });

  // console.info(util.inspect(jsonPayload, { showHidden: false, depth: null }));

  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Content-Type": "application/json",
    "Content-Length": jsonPayload.length,
    "Accept-Charset": "utf-8",
    "Authorization": "Bearer " + config.access_token
  };

  let options = {
    url: config.alexaInboundGatewayEndpoint,
    method: "POST",
    headers: headers,
    json: jsonPayload
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      //console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.statusCode === 202) {
          resolve("changeReport PSU sent successfully!");
        }
        else {
          resolve(body);
        }
      }
      else {
        reject(response.body.payload.description);
      }
    });
  });
};

/*-------
    Send async Alexa.Response
  -------*/
const fnSendAsyncResponse = (correlationToken) => {
  let fileData = fs.readFileSync('asyncAlexaResponse.json');
  let jsonPayload = JSON.parse(fileData); 
  jsonPayload.event.header.messageId = uuid();
  jsonPayload.event.header.correlationToken = correlationToken;
  jsonPayload.event.endpoint.scope.token = config.access_token;

  //console.info(util.inspect(jsonPayload, { showHidden: false, depth: null }));

  let headers = {
    "HTTP-Version": "HTTP/1.1",
    "Content-Type": "application/json",
    "Content-Length": jsonPayload.length,
    "Accept-Charset": "utf-8",
    "Authorization": "Bearer " + config.access_token
  };

  let options = {
    url: config.alexaInboundGatewayEndpoint,
    method: "POST",
    headers: headers,
    json: jsonPayload
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      // console.info('Error: ', JSON.stringify(error), '\nResponse: ', JSON.stringify(response), "\nBody:", JSON.stringify(body));
      if (error) {
        reject(error, response);
      }
      else if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.statusCode === 202) {
          resolve("async Alexa.Response sent successfully!");
        }
        else {
          resolve(body);
        }
      }
      else {
        reject(response.body.payload.description);
      }
    });  
  });
}

module.exports = {
  "fnExchangeAuthCodeForTokens": fnExchangeAuthCodeForTokens,
  "fnCheckTokenValidity": fnCheckTokenValidity,
  "fnRefreshOAuth2Tokens": fnRefreshOAuth2Tokens,
  "fnSendAddOrUpdateReport": fnSendAddOrUpdateReport,
  "fnSendChangeReport": fnSendChangeReport,
  "fnSendAsyncResponse": fnSendAsyncResponse
}
