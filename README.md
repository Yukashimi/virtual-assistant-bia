# Virtual Assistant
A Virtual Assistant built using IBM's Watson.
This chat interface is HTML5 based and is deployed by a node.js server, but the training data isn't publicly available just yet, if you have your own training data it's possible to utilize this server and interface with it by setting your WORKSPACE_ID, ASSISTANT_USERNAME AND ASSISTANT_PASSOWRD on the .env file.

The interface in itself was made based on FACEB, a Brazilian pension funds company, and the original training data was designed to be their virtual assistant, with the porpurse to answer questions about pension funds and welfare, as well as accessing their participant database.

### HTML Pages Deployed
1. index.html: this is the main interface and where you can interact with the bot. If you don't load the scripts at `/js/watson-api/`dir then it's possible to load the interface without booting the bot every single time, the html document in itself also has demostration mensagens, they are commented in the code itself, so just uncomment to see.
2. notepad.html: here you can write down your own notes while working on the server/anything else really, being a public file means you can load and edit your notes from your phone, by default it requires a password.
3. graph.html: this creates an usage graph so you can keep an eye on how many API calls to Watson's API were made, unfortunately you have to update it manually right now.
