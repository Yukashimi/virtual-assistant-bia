# Server-side Functions and API
The "Monika package" is where all the custom scripts are located.
She handles things like HTTP calls, validating inputs and any additional action the app has to take in order to keep the chat flow nice.
There is also a notepad app to write down any notes during development.

### Quick File Overview:
* index.js
  Exports the module, allowing other scripts to require and use her.
* api-handler.js
  This script handles any API call to the database, note that it actually consumes an external API
* bot-actions.js
  Here any extra steps are taking during the conversation flow, such as send emails. All the endpoints are also set here.
* helper.js
  Quick information about the valid API routes that should be called during the conversation flow, this information is also called by the /api/ endpoint.
* http.js
  Handles all the HTTP actions. Set options, send requests and check for HTTP status.
* mailer.js
  This handles e-mail sending, it uses nodemailer.
* monika.js
  Monika takes care of the conversation logging, she writes down both the "basic" log with only the mensagens exchanged between user and bot as well as a "complete" version with user intents and the confidence.
* notes.js
  Writes down and load the notepad.
