/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic-widget.js
*/

let analytic = (() => {
  
  const CONVO_STATUS = {
    "pedente": "<i class='fas fa-exclamation-triangle'></i>",
    "finalizada": "<i class='fas fa-check'></i>"
  };
  const OPERATIONS = {
    "type": () => {
      search.input.addClass("hide-x");
      search.kind.removeClass("hide-x");
      search.input.val("");
    },
    "date": () => {
      search.input.attr("type", "date");
      search.input.removeClass("hide-x");
      search.input.focus();
      search.kind.addClass("hide-x");
    },
    "default": () => {
      search.input.attr("type", "input");
      search.input.removeClass("hide-x");
      search.input.focus();
      search.kind.addClass("hide-x");
    }
  };
  const SETTINGS = {
    paths: {
      "list": "/analytic/list",
      "header": "/analytic/header",
      "graph": "/analytic/graph",
      "detail": "/analytic/detail"
    },
    callbacks: {
      "list": displayList,
      "header": displayHeader,
      "graph": drawGraph,
      "detail": showDetails
    }
  };
  
  let db_ref = "";
  let end;
  let full;
  let graph_box;
  let header;
  let info;
  let lastID = 0;
  let list;
  let new_support;
  let start;
  let selector;
  let show_graph;
  let search = {
    "input": null,
    "kind": null,
    "method": null,
    "status": null,
    "submit": null
  }
  
  $(document).ready(() => {
    init();
  });
  
  function changeDate(){
    redraw(selector.find(":selected").val());
  }
  
  function changeMethod(){
    let method = search.method.find(":selected").val();
    let run = OPERATIONS[method] || OPERATIONS["default"];
    run();
  }
  
  function convoBubble(summary, thislist){
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
      "info": {
        "icon": "<i class='fas fa-info'></i>",
        "class": "bubble info"
      },
      "pending": {
        "icon": "<i class='fas fa-tasks'></i>",
        "class": "bubble"
      }
    }
    
    for(let s = 0; s < msgs.length; s++){
      convo = convo + $("<li>", {"class": aux[msgs[s][1]].class}).append(
        $("<span>", {"class": "fa-li"}).append(aux[msgs[s][1]].icon),
        msgs[s][0]
      ).prop("outerHTML");
    }
    
    thislist.append(
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.info.icon),
          ("Protocolo de Atendimento: " + summary.protocol +
          "&nbsp;&nbsp;&nbsp;<i class='far fa-clock'></i>&nbsp;:&nbsp;" +
          summary.time)
      ),
      $("<li>", {"class": aux.info.class}).append(
        $("<span>", {"class": "fa-li"}).append(aux.User.icon),
        summary.name
      ),
      convo
    );
    
    if(summary.status === 2){
      sessionStorage.setItem("lastid", lastID);
      thislist.append(
        $("<li>", {"class": aux.pending.class}).append(
          $("<span>", {"class": "fa-li"}).append(aux.pending.icon),
          $("<a>", {"href": "pending", "class": "pending", "target": "_self"})
            .append("Prosseguir Atendimento <i class='fas fa-external-link-alt'></i>")
        )
      );
    }
  }
  
  function datedDraw(){
    let date = {
      start: start.val(),
      end: end.val()
    };
    let a = new Date(date.end);
    let b = new Date(date.start);
    let days = (Math.ceil(Math.abs((a.getTime() - b.getTime()) / (1000 * 3600 * 24))));
    if(days > 50){
      header.html("<b>Limite de 50 dias! A data que você escolheu tem " + days + " dias.</b>");
      return;
    }
    if(date.start !== "" && date.end !== ""){
      let path = db_ref + "&start=" + date.start + "&end=" + date.end;
      http.request.setOptions("GET", "/analytic/graph" + path);
      http.request.call(tempGraph, "");
      load("header");
      return;
    }
    header.html("<b>Por favor insira uma data válida</b>");
  }
  
  function displayHeader(httpObj){
    return () => {
      let header_info = JSON.parse(httpObj.response);
      header.html("Número de atendimentos realizados: " + header_info.convo +
          "   Número total de mensagens: " + header_info.msgs +
          "   Tempo médio de cada atendimento: " + header_info.average);
    }
  }

  function displayList(httpObj){
    return () => {
      let body_info = JSON.parse(httpObj.response);
      let html = "";
      list.html("");
      for(let l = 0; l < body_info.length; l++){
        listTemplate(body_info[l]);
      }
      list.parent().css("height", (20 + 97 * body_info.length));
    }
  }
  
  function init(){
    initUI();
    let url = window.location.pathname;
    db_ref = "?db=" + (url.substring(0, url.lastIndexOf('/'))).replace("/", "");
    graph.draw.init("graph", 15, 12, 50);
    load("header");
    load("list");
    load("graph");
    setActions();
  }
  
  function download(){
    let dt = document.getElementById("graph").toDataURL('image/png');
    this.href = dt.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  };
  
  function drawGraph(httpObj){
    return () => {
      setData(httpObj);
      let value = "month";
      redraw(value);
    }
  }
  
  function initUI(){
    graph_box = $("#graph-box");
    end = $("#end");
    full = $("#full");
    start = $("#start");
    selector = $("#data-selector");
    header = $("#header");
    list = $("#convo_list");
    new_support = $("#new");
    search.input = $("#param");
    search.kind = $("#kinds");
    search.method = $("#method");
    search.status = $("#status");
    search.submit = $("#search");
    setMaxDate();
    show_graph = $("#show-graph");
  }
  
  function listTemplate(info){
    list.append(
      $("<li>", {"id": info.id}).append(
        $("<p>").append(
          $("<span>", {"html": "&nbsp;&nbsp;" + CONVO_STATUS[info.status]})
            .prepend($("<i>", {"class": "far fa-comments"})),
          $("<span>", {"html": "&nbsp;&nbsp;&nbsp;" + info.name})
            .prepend($("<i>", {"class": "fas fas fa-user"})),
          $("<span>", {"html": "&nbsp;&nbsp;&nbsp;" + info.date})
            .prepend($("<i>", {"class": "fas fa-calendar-alt"})),
          $("<button>", {"class": "more-info",
          html: "Ver Mais <i class='fas fa-comments'></i>"})
        )
      )
    );
    $("#" + info.id).find("p").find(".more-info").click(() => loadDetails(info.id));
  }

  function load(what, query=""){
    query = db_ref + query;
    http.request.setOptions("GET", (SETTINGS.paths[what] + query));
    http.request.call(SETTINGS.callbacks[what], "");
  }
  
  function loadDetails(currentId){
    if(lastID !== currentId){
      lastID = currentId;
      let p = "&param=" + currentId + "&method=id";
      return load("detail", p);
    }
    graph_box.addClass("hide-y");
    full.removeClass("hide-y");
  }
  
  function redraw(graphInfo, dates){
    let value = graphInfo;
    if(graph.draw.checkContext()){
      graph.draw.background();
      graph.draw.xAxis(info[value].tags, info[value].name);
      graph.draw.yAxis(info[value].max, info.name);
      graph.draw.line(info[value].tags.length, info[value].amount, info[value].max);
    }
    else{
      console.log("No support detected.");
    }
  }
  
  function showDetails(httpObj){
    return () => {
      if(httpObj !== ""){
        let info = JSON.parse(httpObj.response);
        convoBubble(info, full.find("ul"));
        graph_box.addClass("hide-y");
        full.removeClass("hide-y");
        return;
      }
    }
  }
  
  function searcher(){
    let param = search.input.val() || search.kind.find(":selected").val();
    let method = search.method.find(":selected").val();
    if(method !== "date"){
      param = param.replace(/\.|\/|\-/g, "");
    }
    let stat = search.status.val();
    if(param !== ""){
      let path = "&param=" + param + "&method=" + method + "&status=" + stat;
      load("list", path);
    }
  }
  
  function setActions(){
    search.input.keydown((event) => util.inputOnEnter(event, searcher));
    search.submit.click(searcher);
    search.method.change(changeMethod);
    selector.change(changeDate);
    start.change(datedDraw);
    end.change(datedDraw);
    new_support.click(() => sessionStorage.setItem("lastid", 0));
    
    show_graph.click(() => {
      graph_box.removeClass("hide-y");
      full.addClass("hide-y");
    });
    
    graph_box.find("#dl").click(download);
  }
  
  function setData(httpObj){
    let data = JSON.parse(httpObj.response);
    info = {
      "name": "Número de Conversas",
      "month": {
        "amount": data.month,
        "max": Math.max.apply(null, data.month),
        "name": "Meses",
        "tags": ["JAN", "FEV", "MAR", "APR", "MAI", "JUN",
                 "JUL", "AGO", "SET", "OUT", "NOV", "DEC"]
      },
      "day": {
        "amount": data.days,
        "max": Math.max.apply(null, data.days),
        "name": "Dias",
        "tags": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]
      },
      "week": {
        "amount": data.week,
        "max": Math.max.apply(null, data.week),
        "name": "Dia da Semana",
        "tags": ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]
      },
      "hour": {
        "amount": data.hours,
        "max": Math.max.apply(null, data.hours),
        "name": "Horas",
        "tags": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23"]
      }
    };
  }
  
  function setMaxDate(){
    let maxDate = util.today();    
    start.attr("max", maxDate);
    start.val(maxDate);
    end.attr("max", maxDate);
    end.val(maxDate);
    search.input.attr("max", maxDate);
  };
  
  function tempGraph(httpObj){
    return () => {
      let data = JSON.parse(httpObj.response);
      let tags = [];
      let values = [];
      let keys = Object.keys(data);
      for(let t = 0; t < keys.length; t++){
        tags[t] = keys[t].substring(5);
        values[t] = data[keys[t]];
      }
      info["range"] = {
        "amount": values,
        "max": Math.max.apply(null, values),
        "name": "Dias",
        "tags": tags
      }
      tags = null;
      values = null;
      keys = null;
      let date = {
        start: start.val(),
        end: end.val()
      };
      redraw("range");
    }
  }
  
  return {};
  
})();
