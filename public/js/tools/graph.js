/*!
  Author: Yukashimi
  Date: 18/07/2018
  File: graph.js
*/

var graph = {}

graph.actions = (function(){
  let border_thickness;
  let call_data;
  let canvas;
  let canvas_size;
  let context;
  let console;
  let date = "21/08/2018";
  let drawing_area;
  let font_size;
  
  $(document).ready(
    function(){
      initContext("graph");
      setData();
      if(canvas.getContext){
        drawBackground();
        columnCalls();
        columnMonths();
        graphLine();
        console.html(console.html() + "<p style='color: blue;'>Last update: " + date + "</p");
      }
      else{
        console.html(console.html() + "<p style='color: red;'>It seems this browser doesn't support canvas</p>");
      }
    }
  );
  
  function columnCalls(){
    let jump = drawing_area.height / (call_data.calls.length + 1);
    let cross = 15;
    for(let i = 0; i < call_data.calls.length; i++){
      context.moveTo((drawing_area.starting_point.x - cross), (drawing_area.starting_point.y - (jump * (i + 1))));
      context.lineTo((drawing_area.starting_point.x + cross), (drawing_area.starting_point.y - (jump * (i + 1))));
      context.stroke();
      //context.font = font_size + 'px serif';
      //context.fillText(1, (drawing_area.starting_point.x + cross), (drawing_area.starting_point.y - (jump * (i + 1)) + font_size / 3));
    }
  }
  
  function columnMonths(){
    let jump = drawing_area.width / (call_data.months.length + 1);
    let cross = 15;
    for(let i = 0; i < call_data.months.length; i++){
      context.moveTo((drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.starting_point.y - cross));
      context.lineTo((drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.starting_point.y + cross));
      context.stroke();
      context.font = font_size + 'px serif';
      context.fillText(call_data.months[i] ,(drawing_area.starting_point.x + (jump * (i + 1)) + font_size / 3), (drawing_area.starting_point.y + cross));
    }
  }
  
  function drawBackground(){
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    context.lineTo(50, 50);
    context.font = font_size + 'px serif';
    context.fillText("4000 Calls", 25, 50);
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    context.lineTo(750, 350);
    context.stroke();
  }
  
  function graphLine(){
    let jump = drawing_area.width / (call_data.months.length + 1);
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    for(let i = 0; i < call_data.months.length; i++){
      context.lineTo((drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.height - (call_data.calls[i] / 4000) * drawing_area.height));
      context.fillStyle = "Blue";
      context.font = font_size + 'px serif';
      context.fillText(call_data.calls[i], (drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.height - (call_data.calls[i] / 4000) * drawing_area.height));
      context.fillStyle = "Black";
    }
    context.lineTo(750, 350);
    context.stroke();
  }
  
  function initContext(id){
    font_size = 12;
    border_thickness = 50;
    canvas = document.getElementById(id);
    context = canvas.getContext("2d");
    console = $("#console");
    canvas_size = {
      height: $("#" + id).height(),
      width: $("#" + id).width()
    };
    drawing_area = {
      starting_point: {
        x: border_thickness,
        y: (border_thickness + (canvas_size.height - (2 * border_thickness)))
      },
      height: (canvas_size.height - (2 * border_thickness)),
      width: (canvas_size.width - (2 * border_thickness))
    };
    context.beginPath();
  }
  
  function setData(){
    call_data = {
      months: ["abril", "maio", "junho", "julho", "agosto"],
      calls: [291, 2017, 1843, 581, 993]
    };
  }
})();