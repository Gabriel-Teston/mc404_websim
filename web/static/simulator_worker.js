/*jshint esversion: 6 */

var stdinBuffer = "12 23";

onmessage = function(e) {
  switch(e.data.type){
    case "code_load":
      files = e.data.code;
      break;
    case "start_sim":
      intController = new InterruptionController();
      importScripts("whisper.js");
      break;
    case "stdin":
      stdinBuffer = e.data.stdin;
      console.log("STDIN = " + stdinBuffer);
      break;
    case "set_args":
      Module.arguments = e.data.vec;
      break;
    case "mmio":
      mmio = new MMIO(e.data.vec);
      break;
  }
};

class MMIO{
  constructor(sharedBuffer){
    this.memory = [];
    this.memory[1] = new Uint8Array(sharedBuffer);
    this.memory[2] = new Uint16Array(sharedBuffer);
    this.memory[4] = new Uint32Array(sharedBuffer);
    this.size = sharedBuffer.byteLength;
  }

  load(addr, size){
    addr &= 0xFFFF;
    if(addr > this.size){
      postMessage({type: "output", subtype: "error", msg: "MMIO Access Error"});
    }
    return Atomics.load(this.memory[size], (addr/size) | 0);
  }

  store(addr, size, value){
    addr &= 0xFFFF;
    if(addr > this.size){
      postMessage({type: "output", subtype: "error", msg: "MMIO Access Error"});
    }
    Atomics.store(this.memory[size], (addr/size) | 0, value);
  }
}

class InterruptionController{
  constructor(){

  }

  get interrupt(){
    console.log("check");
    return 0;
  }
}


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
  arguments : ["--newlib", "/working/ex2", "--isa", "acdfimsu", "--setreg", "sp=0x10000"],
  preRun : [initFS],
  print : function (text) {postMessage({type: "stdio", stdioNumber: 1, msg: text});},
  printErr : function (text) {postMessage({type: "stdio", stdioNumber: 2, msg: text});}
};
