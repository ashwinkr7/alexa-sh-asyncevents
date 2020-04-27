"use strict";

const fs = require('fs')
const request = require("request")
const util = require('util')
const inquirer = require('inquirer')
const psu = require('./psu')

/*----
  Convenience function to get the "Press ENTER to continue" effect
  ----*/
const enter2Continue = () => {
  return new Promise((resolve, reject) => {
    const rl = require('readline').createInterface({
      input: process.stdin, output: process.stdout
    })

    rl.question('press <enter> to continue...', (keypress) => {
      rl.close()
      resolve()
    })
  })
}

/*----
  Generate inquirer.js powered menu
  ----*/
const showMenu = () => {
  const questions = [
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "Exchange LWA AuthCode for LWA OAuth2 tokens", value: "ExchangeAuthCodeForTokens" },
        { name: "Check Validity of LWA Access Token", value: "CheckTokenValidity" },
        { name: "Refresh LWA Access Token", value: "RefreshOAuth2Tokens" },
        { name: "Send addOrUpdateReport", value: "SendAddOrUpdateReport" },
        { name: "Send changeReport", value: "SendChangeReport" },
        { name: "Send async Response", value: "SendAsyncResponse" },
        { name: "Exit program", value: "quit"}
      ]
    }
  ]
  return inquirer.prompt(questions)
}

/*----
  Main function which uses a forever-loop, going back to the top-level menu after every action
  ----*/
const main = async () => {
  while (true) {
    try {
      // Clear the screen
      process.stdout.write("\u001b[2J\u001b[0;0H")

      const choice = await showMenu()
      let data = null

      if (choice.action === 'ExchangeAuthCodeForTokens') {
        let _input = await inquirer.prompt([
          {
            type: 'input',
            name: 'authCode',
            message: "Enter authorization code (from CloudWatch log of Alexa.AcceptGrant directive):"
          }
        ])
        data = await psu.fnExchangeAuthCodeForTokens(_input.authCode)
      }
      else if (choice.action === 'CheckTokenValidity') {
        data = await psu.fnCheckTokenValidity()
      }
      else if (choice.action === 'RefreshOAuth2Tokens') {
        data = await psu.fnRefreshOAuth2Tokens()
      }
      else if (choice.action === 'SendAddOrUpdateReport') {
        data = await psu.fnSendAddOrUpdateReport()
      }
      else if (choice.action === 'SendChangeReport') {
        data = await psu.fnSendChangeReport()
      }
      else if (choice.action === 'SendAsyncResponse') {
        let _input = await inquirer.prompt([
          {
            type: 'input',
            name: 'correlationToken',
            message: "Enter correlation token (from CloudWatch log of Alexa.PowerController directive):"
          }
        ])
        data = await psu.fnSendAsyncResponse(_input.correlationToken)
      }
      else { // (choice.action === 'quit')
        console.info('Exiting program')
        process.exit(0)
      }

      console.info(util.inspect(data, { showHidden: false, depth: null }))
    }
    catch (err) {
      console.error('Error:', err)
    }
    await enter2Continue()
  }
}

main()
