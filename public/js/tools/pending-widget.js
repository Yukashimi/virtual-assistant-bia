/*!
  Author: Yukashimi
  Date: 04/10/2018
  File: pending-widget.js
*/

let pending = (() => {
  let checkup;
  let current;
  let context;
  let date = {"start": "", "end": ""};
  let end;
  let info = {
    "id": 0,
    "protocol": "NA",
    "ibm": 0
  };
  let list;
  let open_checkup;
  let output;
  let question;
  let previous;
  let protocol;
  let resp;
  let return_box;
  let start;
  let support;
  let ta;
  let virgin;
  
  $(document).ready(() => {
    init();
  });
  
  function askBia(){
    Api.sendRequest(checkup.val(), context, resBia);
  }
  
  function resBia(xhttp){
    return () => {
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
    return () => {
      if(199 < httpObj.status && httpObj.status < 300){
        support.addClass("hide-y");
        ManuTimer = () => {};
        return_box.removeClass("hide-y");
        let before = return_box.html();
        return_box.html(JSON.parse(httpObj.response).msg + "<br>" +
          "Protocolo: " + info.protocol + "<br>" + before);
        list.addClass("hide-y");
        open_checkup.attr("disabled", "disabled");
        resp.addClass("hide-y");

        $("#apiframe").addClass("hide-y");
        $("#apiframe").css("border", 0);
      }
    };
  }
  
  function init(){
    initUI();
    loadChat();
    setActions();
    setQuickContext({"dontlog": true, "article": "O", "title": "Sr.", "name": "Atendente"});
    date.start = new Date();
    
    $("#now").html(util.today());
  }
  
  function initProcess(httpObj){
    return () => {
      if(199 < httpObj.status && httpObj.status < 300){
        startTimer();
        ta.removeAttr("disabled");
        ta.attr("placeholder", "Digite o atendimento");
        let temp = JSON.parse(httpObj.response);
        info.id = temp.id;
        info.protocol = util.protocol(temp.protocol);
        info.ibm = temp.ibm;
        protocol.find("div").html("Protocolo: " + info.protocol);
        protocol.removeClass("hide-li");
        $(':radio:not(:checked)').removeAttr("disabled");
      }
    };
  }
  
  function initUI(){
    checkup = $("#checkup");
    end = $("#end");
    list = $("#list");
    open_checkup = $("#open-checkup");
    output = $("#response");
    previous = $("#previous");
    protocol = $("#protocol");
    question = $("#question");
    resp = $("#response-box");
    return_box = $("#return-box");
    start = $("#start");
    support = $("#support");
    ta = $("#relate");
    virgin = $("#virgin");
  }
  
  function loadChat(){
    if(sessionStorage.getItem("lastid") > 0){
      previous.removeClass("hide-y");
      end.removeClass("hide-x");
      current = sessionStorage.getItem("lastid") || 0;
      http.request.setOptions("GET", "/analytic/load/detail?id=" + current);
      http.request.call(showSummary, "");
      return;
    }
    virgin.removeClass("hide-y");
    start.removeClass("hide-x");
  }
  
  let ManuTimer = function(){
    //let startTime = 0;
    date.end = new Date();
    
    let diff = date.end - date.start;
    let ManuTimerID = 0;

    diff = new Date(diff);
    let sec = diff.getSeconds();
    let min = diff.getMinutes();
  
    if (min < 10) { min = "0" + min; }
    if (sec < 10) { sec = "0" + sec; }

    document.getElementById("timer").innerHTML = min + ":" + sec;
    ManuTimerID = setTimeout(ManuTimer, 10);
  };
  
  function newInit(){
    let new_convo = JSON.stringify(
      {"id": 0, "name": $("#iname").val(), "date": (new Date()), "level": 1,
        "contact": {
          "tel": $("#iphone").val(), "cpf": $("#icpf").val(), "email": $("#imail").val()
        }
      }
    );
    http.request.setOptions("PUT", "/analytic/new");
    http.request.call(initProcess, new_convo);
    end.removeClass("hide-x");
    virgin.find("ul").find("li").find("input").attr("disabled", "disabled");
  }
  
  function setActions(){
    open_checkup.click(toggler(resp, ["", "hide-y"]));
    checkup.keydown(
      (event) => {
        return util.inputOnEnter(event, askBia);
      }
    );
    question.click(askBia);
    end.click(updateService);
    start.click(newInit);
  }
  
  function setQuickContext(options){
    context = options;
  }
  
  function showSummary(httpObj){
    return () => {
      info = JSON.parse(httpObj.response);
      summaryBubble(info, list.find("ul"));
      
      let new_convo = JSON.stringify(
        {"id": info.id, "name": info.name, "ibm": info.ibm, "date": date.start, "level": 2,
          "contact": {
            "tel": info.phone, "cpf": info.cpf, "email": info.email
          }
        }
      );
      http.request.setOptions("PUT", "/analytic/new");
      http.request.call(initProcess, new_convo);
    };
  }
  
  function startTimer(){
    ManuTimer();
  }
  
  function summaryBubble(summary, thislist){
    let msgs = summary.msgs;
    thislist.html($("<ul>", {"class": "fa-ul"}));
    thislist = thislist.find("ul");
    let convo = "";
    let aux = {
      "Bot": {
        "icon": "<i class='fas fa-headset'></i>",
        "class": "bubble bot"
      },
      "User": {
        "icon": "<i class='fas fa-user'></i>",
        "class": "bubble user"
      },
      "convo": {
        "icon": "<i class='far fa-comments'></i>",
        "class": "bubble summary"
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
    
    for(let s = 0; s < msgs.length; s++){
      convo = convo + $("<li>", {"class": aux[msgs[s][1]].class}).append(
        $("<span>", {"class": "fa-li"}).append(aux[msgs[s][1]].icon),
        msgs[s][0]
      ).prop("outerHTML");
    }
    
    thislist.append(
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.info.icon.general),
        ("Protocolo de Atendimento: " + summary.protocol)
      ),
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.info.icon.general),
        (aux.info.icon.date + "&nbsp;:&nbsp;" + summary.date +
          "&nbsp;&nbsp;&nbsp;" + aux.info.icon.clock + "&nbsp;:&nbsp;" +
          summary.time)
      ),
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.User.icon),
        (summary.name + " (CPF: " + summary.cpf + ")")
      ),
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.info.icon.phone),
        summary.phone
      ),
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.info.icon.email),
        summary.email
      ),
      $("<li>", {"class": aux.info.class}).append(
        aux.convo.icon + " Resumo do Atendimento:"
      ),
      convo
    );
  }
  
  function toggler(target, classArr){
    return () => {
      target.toggleClass(classArr[0]).toggleClass(classArr[1]);
    };
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
    http.request.setOptions("POST", "/analytic/update");
    http.request.call(endProcess, updated);
  }
  
})();