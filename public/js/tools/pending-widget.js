/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: pending-widget.js
*/

let pending = (function(){
  let checkup;
  let current;
  let context;
  let date = {"start": "", "end": ""};
  let end;
  let info;
  let list;
  let open_checkup;
  let output;
  let question;
  let resp;
  let support;
  let ta;
  
  $(document).ready(function(){
    init();
  });
  
  function askBia(){
    Api.sendRequest(checkup.val(), context, resBia);
  }
  
  function resBia(xhttp){
    return function(){
      let outputArr = JSON.parse(xhttp.responseText).output.text;
      let botText = "";
      for(let o = 0; o < outputArr.length; o++){
        botText = botText + outputArr[0] + "<br>";
      }
      output.html(botText);
      checkup.val("");
      checkup.focus();
    };
  }
  
  function endProcess(httpObj){
    return function(){
      if(199 < httpObj.status && httpObj.status < 300){
        support.addClass("hide");
        ManuTimer = function(){};
        $("#someid").removeClass("hide");
        let before = $("#someid").html();
        $("#someid").html(JSON.parse(httpObj.response).msg + "<br>" +
          "Protocolo: " + info.protocol + "<br>" + before);
        list.addClass("hide");
        open_checkup.attr("disabled", "disabled");
      }
    }
  }
  
  function init(){
    initUI();
    loadChat();
    setActions();
    setQuickContext({"dontlog": true, "article": "O", "title": "Sr.", "name": "Atendente"});
    date.start = new Date();
  }
  
  function initProcess(httpObj){
    return function(){
      if(199 < httpObj.status && httpObj.status < 300){
        startTimer();
        ta.removeAttr("disabled");
        ta.attr("placeholder", "Digite o atendimento");
        let temp = JSON.parse(httpObj.response);
        info.id = temp.id;
        info.protocol = temp.protocol;
      }
    }
  }
  
  function initUI(){
    checkup = $("#checkup");
    end = $("#end");
    list = $("#list");
    open_checkup = $("#open-checkup");
    output = $("#response");
    question = $("#question");
    resp = $("#response-box");
    support = $("#support");
    ta = $("#relate");
  }
  
  function inputKeyDown(event){
    if (event.keyCode === 13 && checkup.val()){
      askBia();
    }
  }
  
  function loadChat(){
    current = sessionStorage.getItem("lastid") || 0;
    http.request.setOptions("GET", "/analytic/load/detail?id=" + current, true, "text", "Content-type", "application/json");
    http.request.call(showSummary, "");
  }
  
  function ManuTimer(){
    let startTime = 0;
    date.end = new Date();
    
    let diff = date.end - date.start;
    let ManuTimerID = 0;

    diff = new Date(diff);
    let sec = diff.getSeconds();
    let min = diff.getMinutes();
  
    if (min < 10) { min = "0" + min; }
    if (sec < 10) { sec = "0" + sec; }

    document.getElementById("timer").innerHTML = min + ":" + sec;
    ManuTimerID = setTimeout(ManuTimer, 10)
  }
  
  function setActions(){
    open_checkup.click(toggler(resp, ["", "hide"]));
    checkup.keypress(inputKeyDown);
    question.click(askBia);
    end.click(updateService);
  }
  
  function setQuickContext(options){
    context = options;
  }
  
  function showSummary(httpObj){
    return function(){
      info = JSON.parse(httpObj.response);
      list.find("ul").html(summaryBubble(info));
      
      
      let new_convo = JSON.stringify(
        {"id": info.id, "name": info.name, "ibm": info.ibm, "date": date.start,
          "contact": {
            "tel": info.phone, "cpf": info.cpf, "email": info.email
          }
        }
      );
      http.request.setOptions("PUT", "/analytic/new", true, "text", "Content-type", "application/json");
      http.request.call(initProcess, new_convo);
    }
  }
  
  function startTimer(){
    ManuTimer();
  }
  
  function summaryBubble(summary){
    let msgs = summary.msgs;
    let html = "<ul class='fa-ul'>";
    let aux = {
      "Bot": {
        "icon": "<i class='fas fa-headset'></i>",
        "class": "bubble bot"
      },
      "User": {
        "icon": "<i class='fas fa-user'></i>",
        "class": "bubble user"
      },
      "info": {
        "icon": {
          "general": "<i class='fas fa-info'></i>",
          "date": "<i class='far fa-calendar-alt'></i>",
          "clock" : "<i class='far fa-clock'></i>",
          "card": "<i class='far fa-address-card'></i>",
          "phone": "<i class='fas fa-phone'></i>",
          "email": "<i class='far fa-envelope'></i>"
        },
        "class": "bubble info"
      }
    };

    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.info.icon.general +
      "</span>Protocolo de Atendimento: " + summary.protocol + "</li>";
    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.info.icon.general +
      "</span>" +
      aux.info.icon.date + "&nbsp;:&nbsp;" + summary.date +
      "&nbsp;&nbsp;&nbsp;" + aux.info.icon.clock + "&nbsp;:&nbsp;" +
      summary.time + "</li>";
    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.User.icon +
      "</span>" + summary.name + " (CPF: " + summary.cpf + ")" + "</li>";

    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.info.icon.phone +
      "</span>" + summary.phone + "</li>";
      
    html = html + "<li class='" + aux.info.class +
      "'><span class='fa-li'>" + aux.info.icon.email +
      "</span>" + summary.email + "</li>";
    for(let s = 0; s < msgs.length; s++){
      html = html +
      "<li class='" + aux[msgs[s][1]].class + "'><span class='fa-li'>" +
      aux[msgs[s][1]].icon + "</span>" + msgs[s][0] + "</li>";
    }
    html = html + "</ul>";
    return html;
  }
  
  function toggler(target, classArr){
    return function(){
      target.toggleClass(classArr[0]).toggleClass(classArr[1]);
    }
  }
  
  function updateService(){
    let stat = $('input[name=status]:checked').val();
    let updated = JSON.stringify({
      "update": {
        "id": info.id, "status": stat, "ibm": info.ibm
      },
      "log": {
        "msg": ta.val(), "date": date.end
      }
    });
    http.request.setOptions("POST", "/analytic/update", true, "text", "Content-type", "application/json");
    http.request.call(endProcess, updated);
  }
  
}());