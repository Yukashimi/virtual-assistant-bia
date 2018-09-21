/*!
  Author: Yukashimi
  Date: 18/09/2018
  File: analytic-widget.js
*/

let analytic = (function(){
  
  let data_counter = 0;
  let data_button;
  let graph_box;
  let header;
  let hide_graph;
  let hide_list;
  let list;
  let list_box;
  
  let info;
  let max_convo;
  
  $(document).ready(function(){
    init();
  });
  
  function displayList(httpObj){
    return function(){
      let body_info = JSON.parse(httpObj.response);
      let html = "";
      for(let l = 0; l < body_info.length; l++){
        html = html + listTemplate(body_info.id[l], body_info.num_msgs[l],
            body_info.date[l], body_info.time[l], body_info.protocol[l],
            body_info.status[l]);
      }
      list.html(html);
    }
  }
  
  function displayHeader(httpObj){
    return function(){
      let header_info = JSON.parse(httpObj.response);
      header.html("Número de atendimentos realizados: " + header_info.convo +
          "   Número total de mensagens: " + header_info.msgs +
          "   Tempo médio de cada atendimento: " + header_info.average);
    }
  }
  
  function init(){
    initUI();
    graph.draw.init("graph", 15, 12, 50);
    loadHeader();
    loadList();
    loadData();
    setActions();
  }
  
  function drawGraph(httpObj){
    return function(){
      setData(httpObj);
      if(graph.draw.checkContext()){
        graph.draw.background();
        graph.draw.xAxis(info.hour_tags, "Horas");
        graph.draw.yAxis(max_convo.hours, "Número de Conversas");
        graph.draw.line(info.hour_tags.length, info.convos_per_hours, max_convo.hours);
      }
      else{
        console.log("No support detected.");
      }
    }
  }
  
  //Mostrar Resumo dos Atendimentos
  //Mostrar Gráfico dos Atendimentos
  
  function hideGraph(){
    if(graph_box.attr("class") === "hide-graph"){
      graph_box.removeClass("hide-graph");
      hide_graph.text("Ocultar Gráfico dos Atendimentos");
      list_box.addClass("hide-list");
      hide_list.text("Mostrar Resumo dos Atendimentos");
      return;
    }
    graph_box.addClass("hide-graph");
    hide_graph.text("Mostrar Gráfico dos Atendimentos");
  }
  
  function hideList(){
    if(list_box.attr("class") === "hide-list"){
      list_box.removeClass("hide-list");
      hide_list.text("Ocultar Resumo dos Atendimentos");
      graph_box.addClass("hide-graph");
      hide_graph.text("Mostrar Gráfico dos Atendimentos");
      return;
    }
    list_box.addClass("hide-list");
    hide_list.text("Mostrar Resumo dos Atendimentos");
  }
  
  function initUI(){
    data_button = $("#graph-data");
    graph_box = $("#graph-box");
    header = $("#header");
    hide_graph = $("#hide-graph");
    hide_list = $("#hide-list");
    list = $("#convo_list");
    list_box = $("#list");
  }

  function listTemplate(id, num_msgs, date, time, protocol, status){
    let content = "Atendimento #" + id + " (" + status + " " + (num_msgs / 2) +
        " mensagens)<br>Conversa com duração de " +
        time +"<br>Data: " + date + "<br>Protocolo: <b>" + protocol + "</b>";

    return ("<li><p>" + content + "</p></li>");
    
    /*return ("<li><h4>Protocolo de atendimento: " + protocol + " ("
        + status + ")</h4>" + num_msgs + " mensagens trocadas em "
        + date + " com duração de " + time +  "</li>");*/
  }
  
  function loadList(){
    http.request.setOptions("GET", "/analytic/load/body", true, "text", "Content-type", "application/json");
    http.request.call(displayList, "");
  }
  
  function loadHeader(){
    http.request.setOptions("GET", "/analytic/load/header", true, "text", "Content-type", "application/json");
    http.request.call(displayHeader, "");
  }
  
  function loadData(){
    http.request.setOptions("GET", "/analytic/load/hours", true, "text", "Content-type", "application/json");
    http.request.call(drawGraph, "");
  }
  
  function setActions(){
    hide_graph.click(hideGraph);
    hide_list.click(hideList);
    data_button.click(toggleData);
  }
  
  function setData(httpObj){
    let data = JSON.parse(httpObj.response)
    info = {
      convos_per_days: data.days,
      convos_per_hours: data.hours,
      day_tags: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
      hour_tags: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23"]
    };
    console.log(info);
    max_convo = {
      days: Math.max.apply(null, info.convos_per_days),
      hours: Math.max.apply(null, info.convos_per_hours)
    };
  }
  
  function toggleData(){
    data_counter++;
    if(data_counter % 2 === 0){
      //redraw();
      data_button.text("Mostrar Conversas Por dia do Més");
      if(graph.draw.checkContext()){
        graph.draw.background();
        graph.draw.xAxis(info.hour_tags, "Horas");
        graph.draw.yAxis(max_convo.hours, "Número de Conversas");
        graph.draw.line(info.hour_tags.length, info.convos_per_hours, max_convo.hours);
      }
      else{
        console.log("No support detected.");
      }
      return;
    }
    data_button.text("Mostrar Conversas Por Hora do Dia");
    if(graph.draw.checkContext()){
      graph.draw.background();
      graph.draw.xAxis(info.day_tags, "Dia do Més");
      graph.draw.yAxis(max_convo.days, "Número de Conversas");
      graph.draw.line(info.day_tags.length, info.convos_per_days, max_convo.days);
    }
    else{
      console.log("No support detected.");
    }
  }
  
}());