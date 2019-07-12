var stdinBuffer = "12 23";

onmessage = function(e) {
  switch(e.data.type){
    case "code_load":
      files = e.data.code;
      break;
    case "start_sim":
      importScripts("whisper.js");
      break;
    case "stdin":
      stdinBuffer = e.data.stdin;
      console.log("STDIN = " + stdinBuffer);
      break;
  }
};

function getStdin (){
  if(stdinBuffer.length == 0){
    console.log("Empty STDIN");
    return null;
  }
  c = stdinBuffer.charCodeAt(0);
  stdinBuffer = stdinBuffer.slice(1);
  return c;
}

function initFS() {
  FS.init(getStdin, null, null);
  FS.mkdir('/working');
  FS.mount(WORKERFS, {
  files: files, // Array of File objects or FileList
  }, '/working');
  // console.log(FS.stat("/working"));
}

var xhr = new XMLHttpRequest();
function getDebugMsg(){
  xhr.open("GET", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
  xhr.send(null);
  return xhr.responseText;
}

var xhrS = new XMLHttpRequest();
function sendDebugMsg(msg){
  xhrS.open("POST", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
  xhrS.send(msg);
}

var Module = {
  // arguments : ["--version"],
  arguments : ["--newlib", "/working/exg", "--isa", "acdfimsu", "--setreg", "sp=0x10000"],
  preRun : [initFS],
  print : function (text) {postMessage({type: "stdio", subtype: 1, msg: text});},
  printErr : function (text) {postMessage({type: "stdio", subtype: 2, msg: text});}
};