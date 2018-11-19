/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var watson = require('watson-developer-cloud'); // watson sdk
let monika = require("./monika").init(["logs", "actions", "config"]);

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper

var assistant = new watson.AssistantV1({
  // If unspecified here, the ASSISTANT_USERNAME and ASSISTANT_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: process.env.ASSISTANT_USERNAME || '<username>',
  password: process.env.ASSISTANT_PASSWORD || '<password>',
  version: '2018-07-10'//'2018-02-16'//
});

/*app.use(function (req, res, next) {
  console.log("[404 NOT FOUND] Someone tried to access a file in the server and it was not found and I don't know what this is good for :'D");
  res.status(404).send("O.o");//File(__dirname + "/errors/404.html");//File("/Users/daniel.ghazaleh/Desktop/src/express/public/404.html");
})*/

function messager(req, res, id){
  var workspace = monika.config.workspaces[id] || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the '
            + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>'
            + 'Once a workspace has been defined the intents may be imported from '
            + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {},
    alternate_intents: true
  };

  // Send the input to the assistant service
  assistant.message(payload, function(err, data) {
    if (err) {
      res.sendStatus(err.code || 500);
      return res.status(err.code || 500).json(err);
    }
    return res.json(updateMessage(payload, data, req.ip, id));
  });
}

// Endpoint to be called from the client side
app.post('/api/message/faceb', (req, res) => messager(req, res, "faceb"));
app.post('/api/message/regius', (req, res) => messager(req, res, "regius"));

monika.actions.setEndpoints(app);

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Assistant service
 * @param  {Object} response The response from the Assistant service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response, ip, id){
  var responseText = null;
  if(!response.output){
    response.output = {};
  }
  else{
    if(!response.context.dontlog){
      monika.logs.log(response, ip, id);
      monika.actions.check(response, ip);
    }
    //console.log(response.output);
    return response;
  }
}

module.exports = app;
