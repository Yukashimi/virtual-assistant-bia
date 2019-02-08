/*!
  Author: Yukashimi
  Date: 20/11/2018
  File: version.js
*/

var url = window.location.pathname;
var version = url.split("/")[1];
//url.replace(/\//g, "");
//(url.substring(0, url.lastIndexOf('/'))).replace("/", "");
if(!document.getElementById((version + "css"))){
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.id   = (version + "css");
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = '/css/' + version + ".css";
  link.media = 'all';
  head.appendChild(link);
  url = null;
  version = null;
  head = null;
  link = null;
}