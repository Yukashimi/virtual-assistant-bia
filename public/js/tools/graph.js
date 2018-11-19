/*!
  Author: Yukashimi
  Date: 21/09/2018
  File: graph.js
*/

let graph = {};

graph.draw = (() => {
  let border_thickness;
  let canvas;
  let canvas_size;
  let context;
  let cross;
  let drawing_area;
  let font_size;
  
  function background(color){
    context.clearRect(0, 0, canvas_size.width, canvas_size.height);
    context.beginPath();
    context.fillStyle = color || "#fff";
    context.fillRect(drawing_area.starting_point.x, border_thickness, drawing_area.width, drawing_area.height);
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    context.lineTo(border_thickness, border_thickness);
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    context.lineTo(drawing_area.starting_point.x + drawing_area.width, drawing_area.starting_point.y);
    context.stroke();
  }
  
  function checkContext(){
    if(canvas.getContext){
      return true;
    }
    else{
      return false;
    }
    return null;
  }
  
  function init(id, c, f, b){
    cross = c;
    font_size = f;
    border_thickness = b;
    canvas = document.getElementById(id);
    context = canvas.getContext("2d");
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
  
  function line(dataXLenght, dataY, max_dataY, color){
    let jump = drawing_area.width / (dataXLenght + 1);
    context.moveTo(drawing_area.starting_point.x, drawing_area.starting_point.y);
    for(let i = 0; i < dataXLenght; i++){
      let y_variation = (border_thickness + (drawing_area.height * (1 - (dataY[i] / (max_dataY + 1)))));
      context.lineTo((drawing_area.starting_point.x + (jump * (i + 1))), y_variation);
      context.strokeStyle = color || "#000";
    }
    context.lineTo(drawing_area.starting_point.x + drawing_area.width, drawing_area.starting_point.y);
    context.stroke();
  }
  
  function xAxis(data, tag){
    let jump = drawing_area.width / (data.length + 1);
    for(let i = 0; i < data.length; i++){
      let yformula = (i % 2 !== 0 && data.length > 24 && (data[i] + "").length > 3 ? (2.8 * cross) : (1.8 * cross));
      let color = (data.length > 24 ? ((i % 2 !== 0) ? "black" : "blue") : "black");
      context.beginPath();
      context.strokeStyle = color;
      context.moveTo((drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.starting_point.y - cross));
      context.lineTo((drawing_area.starting_point.x + (jump * (i + 1))),
          (drawing_area.starting_point.y + cross));
      context.stroke();
      context.font = font_size + 'px serif';
      context.fillStyle = color;
      context.fillText(data[i], (drawing_area.starting_point.x + (jump * (i + 1)) - ((data[i] + "").length) * 3), (drawing_area.starting_point.y + yformula));
      context.closePath();
    }
    context.closePath();
    context.strokeStyle = "black";
    context.fillStyle = "black";
    if(tag){
      context.fillText(tag, (drawing_area.starting_point.x + (jump * (data.length + 1/2)) + font_size / 3), (drawing_area.starting_point.y + cross));
    }
  }
  
  function yAxis(data, tag){
    let m = 1;
    let mod = 3;
    if(data > 30){
      data = data / 10;
      m = 10;
      mod = (m / 10);
    }
    let jump = drawing_area.height / (data + 1);
    for(let i = 0; i < data; i++){
      if((i + 1) % mod === 0){
        context.beginPath();
        context.setLineDash([7, 6]);
        context.moveTo((drawing_area.starting_point.x), (drawing_area.starting_point.y - (jump * (i + 1))));
        context.lineTo((drawing_area.width + border_thickness), (drawing_area.starting_point.y - (jump * (i + 1))));
        context.stroke();
      }
      context.beginPath();
      context.setLineDash([0]);
      context.moveTo((drawing_area.starting_point.x - cross), (drawing_area.starting_point.y - (jump * (i + 1))));
      context.lineTo((drawing_area.starting_point.x + cross), (drawing_area.starting_point.y - (jump * (i + 1))));
      context.stroke();
      context.font = font_size + 'px serif';
      context.fillText(((i + 1) * m), (drawing_area.starting_point.x + cross), (drawing_area.starting_point.y - (jump * (i + 1)) - font_size / 5));
    }
    if(tag){
      context.fillText(tag, (drawing_area.starting_point.x - (tag.length / 2)), (drawing_area.starting_point.y - (jump * (data + 1)) - font_size / 5));
    }
  }
  
  return {
    background: background,
    checkContext: checkContext,
    init: init,
    line: line,
    xAxis: xAxis,
    yAxis: yAxis
  }
})();