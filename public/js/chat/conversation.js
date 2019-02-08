/*!
  Author: Yukashimi
  Date: 16/05/2018
  File: conversation.js
  Original file by IBM
*/

// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/

var ConversationPanel = (function(){
  let timer;
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.user-message',
      fromWatson: '.bot-message',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  };
  
  // Constructs new DOM element from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var textArray = isUser ? newPayload.input : newPayload.output.generic;
    if (Object.prototype.toString.call( textArray ) !== '[object Array]') {
      textArray = [textArray];
    }
    var messageArray = [];
    let name = (newPayload.context.name != null) ? newPayload.context.name : 'Você';
    $('.message-data-name-user').each(
      function(){
        if($(this).text() === 'Você'){
          $(this).html(name + '<i class="fas fa-circle user"></i>');
        }
      }
    );
    textArray.forEach(function(currentText) {
      if(currentText){
        let messageJson = generateMessageJson(newPayload, isUser, name, currentText);
        messageArray.push(Common.buildDomElement(messageJson));
      }
    });
    return messageArray;
  }
  
  function chatDelay(item, index, array, cb, chatBoxElement, newPayload, isUser){
    let temp_item = isUser ? newPayload.input : newPayload.output.generic[index];
    let times = (temp_item.text || temp_item.title).length * 10;
    if(isUser){
      chatBoxElement.appendChild(item);
      chat.actions.lock("textInput", "Por favor, aguarde.");
      setTimeout(() => {
        $(".message-typing").css({"visibility": "visible"});
      }, times);
      cb();
    }
    else if(!isUser){
      setTimeout(() => {
        chatBoxElement.appendChild(item);
        $(".message-typing").css({"visibility": "hidden"});
        newPayload.output.text = item;
        if((index + 1) !== array.length){
          $(".message-typing").css({"visibility": "visible"});
        }
        if((index + 1) === array.length){
          chat.actions.unlock("textInput");
        }
        chat.actions.scrollToChatBottom("history", 500)
        cb();
      }, times);
    }
  }
  
  function chatTimeOut(newPayload){
    if(timer){
      clearTimeout(timer);
      timer = 0;
    }
    timer = setTimeout(function(){
      if(!newPayload.context.timedout){
        chat.actions.lock("textInput", "Chat encerrado.");
        chat.actions.unlock = util.disabled();
        newPayload.context.timedout = true;
        Api.sendRequest('', newPayload.context);
      }
    }, 600000);
    if(newPayload.output !== undefined){
      if(newPayload.output.action === 'end_conversation'){
        timedLock(5000);
      }
      if(newPayload.output.action === 'abrupt_end'){
        timedLock(1000);
      }
    }
  }
  
  function timedLock(miliseconds){
    clearTimeout(timer);
    timer = 0;
    timer = setTimeout(function(){
      chat.actions.lock("textInput", "Chat encerrado.");
      chat.actions.unlock = util.disabled();
    }, miliseconds);
  }
  
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup(){
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr){
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr){
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.watson);
    };
  }
  
  function checkActions(newPayload){
    let extra_actions = {
      'init_context': (pl) => initContext(pl),
      'retirement_time': (pl) => retirementTime(pl),
      'loan_active': (pl) => activeLoans(pl),
      'loan_by_contract': (pl) => contractedLoans(pl)
    };
    
    (extra_actions[newPayload.output.action] || (() => {}))(newPayload);
  }
  
  function displayMessage(newPayload, typeValue){
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    if(isUser !== null && textExists){
      if(!isUser){
        checkActions(newPayload);
      }
      outputMsg(newPayload, isUser);
      chatTimeOut(newPayload);
    }
  }
  
  function generateMessageJson(payload, isUser, name, currentText){
    // This defines the message bubble template
    let messageJson;
    let outputtedMessage;
    if(payload.output && currentText.hasOwnProperty('options')){
      outputtedMessage = [{
        'tagName': 'span',
        'text': currentText.title
      },
      {
        'tagName': 'span',
        'text': generateOptions(payload)
      }];
    }
    else{
      outputtedMessage = [{
        'tagName': 'span',
        'text': currentText.text
      }];
    }

    let generalInfo = [
      {
        'tagName': 'span',
			  'classNames': [(isUser ? 'message-data-name-user' : 'message-data-name-bot')],
			  'text': (isUser ? name : 'Bia'),
			  'children': [
          {
            'tagName': 'i',
			      'classNames': ['fas', 'fa-circle', (isUser ? 'user' : 'online')]
			    }
			  ]
			},
      {
        'tagName': 'span',
			  'classNames': ['message-data-time'],
			  'text': util.now()
      }
    ];

    messageJson = {
      // <li class='clearfix'>
      'tagName': 'li',
      'classNames': ['clearfix'],
      'children': [
		    {
		     // <div class="message-data align-right/left">
		     'tagName': 'div',
		     'classNames': ['message-data', (isUser ? 'align-right' : 'filler')],
		     'children': (isUser ? [generalInfo[1], generalInfo[0]] : [generalInfo[0], generalInfo[1]])
		    },
		    {
          // <div class='from-user/from-watson latest'>
          'tagName': 'div',
          'classNames': ['message', (isUser ? 'user-message' : 'bot-message'), 'latest', (isUser ? 'float-right' : 'filler')],
          'children': [
            {
              'tagName': 'p',
              'classNames': ['bubble'],
              'children': outputtedMessage
            }
          ]
        }
      ]
    };
    return messageJson;
  }
  
  function generateOptions(payload){
    const GENERIC_LENGTH = payload.output ? payload.output.generic.length - 1 : 0;
    
    let optionsArray = payload.output.generic[GENERIC_LENGTH].options;
    let options = "";
          
    for(let i = 0; i < optionsArray.length; i++){
      options = `${options}<li><button class='chat-button' onclick='ConversationPanel.submitOption(this)' type='button' value='${optionsArray[i].value.input.text}'>${optionsArray[i].label}</button></li>`;
    }
    /*"' name='" + optionsArray[i].value.input.text +*/ 
    return `<ul>${options}</ul>`;
  }

  function init(){
    if(auth.isLogged("bot")){
      chatUpdateSetup();
      Api.sendRequest('', null);
    }
  }
  
  function inputKeyDown(event, inputBox){
    if (event.keyCode === 13 && inputBox.value){
      chat.actions.send();
    }
  }
  
  function isUserMessage(typeValue){
    if(typeValue === settings.authorTypes.user){
      return true;
    }
    if(typeValue === settings.authorTypes.watson){
      return false;
    }
    return null;
  }
  
  function outputMsg(newPayload, isUser){
    var messageDivs = buildMessageDomElements(newPayload, isUser);
    var chatBoxElement = document.querySelector(settings.selectors.chatBox);
    var previousLatest = chatBoxElement.querySelectorAll((isUser
        ? settings.selectors.fromUser : settings.selectors.fromWatson)
        + settings.selectors.latest);
    // Previous "latest" message is no longer the most recent
    if(previousLatest){
      Common.listForEach(previousLatest, function(element){
        element.classList.remove('latest');
      });
    }
    
    let requests = messageDivs.reduce((promiseChain, item, index, array) => {
      return promiseChain.then(() => new Promise((resolve) => {
        chatDelay(item, index, array, resolve, chatBoxElement, newPayload, isUser);
      }));
    }, Promise.resolve());
      
    requests.then(() => chat.actions.scrollToChatBottom("history", 500));
  }
  
  function submitDropdown(clickedButton){
    $(clickedButton).parent().removeClass("x");
    $(clickedButton).parent().parent().find(".drop-initer").attr("disabled", "disabled");
    let value = clickedButton.value;
    value = value.split(",");
    let path = "/api/loan";
    let READY = false;
    let entid = global_data.DadosPessoais.COD_ENTID;
    if(entid !== undefined && entid !== null & entid !== ""){
      path = path + "?entid=" + entid + "&cont=" + value[0] + "&year=" + value[1];
      READY = true;
    }
    if(READY){
      http.request.setOptions("GET", path);
      http.request.call(submitDropdownResponse, "");
    }
    if(!READY){
      let pay = Api.getResponsePayload();
      Api.sendRequest('', pay.context);
    }
  }
  
  function submitDropdownResponse(httpobj){
    return () => {
      let pay = Api.getResponsePayload();
      pay.context.valid_amount = false;
      if(399 < httpobj.status && httpobj.status < 500){
        Api.sendRequest('', pay.context);
      }
      if(httpobj.status === 200){
        pay.context.amount = JSON.parse(httpobj.response);
        pay.context.amount = pay.context.amount.value;
        pay.context.valid_amount = true;
        Api.sendRequest('', pay.context);
      }
      $(".message-typing").css({"visibility": "hidden"});
      return;
    }
  }
  
  function submitOption(clickedButton){
    var context;
    var latestResponse = Api.getResponsePayload();
    if(latestResponse){
      context = latestResponse.context;
    }
    Api.sendRequest(clickedButton.value, context);
    //Common.fireEvent(inputBox, 'input');
    $(".chat-button").attr("disabled", "disabled");
    $(clickedButton).addClass("clicked");
  }
  
  return {
    init: init,
    inputKeyDown: inputKeyDown,
    submitDropdown: submitDropdown,
    submitOption: submitOption
  };
}());
