/*jshint esversion: 6 */

var stdinBuffer = "";

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
    case "set_args":
      Module.arguments = e.data.vec;
      break;
    case "mmio":
      mmio = new MMIO(e.data.vec);
      break;
    case "syscall":
      syscall_emulator.register(parseInt(e.data.num), e.data.code);
      break;
    case "interrupt":
      intController.changeState(parseInt(e.data.state));
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
    this.state = 0;
  }

  changeState(state){
    this.state = state;
  }

  get interrupt(){
    return this.state;
  }

  get interruptEnabled(){
    return 1;
  }
}

class SyscallEmulator{
  constructor(){
    this.syscalls = [];
  }

  register(number, code){
    this.syscalls[number] = code;
  }

  run(a0, a1, a2, a3, a7){
    if(a7 in this.syscalls){
      var sendMessage = function(msg){
        postMessage({type: "device_message", syscall: a7, message: msg});
      };
      eval(this.syscalls[a7]);
    }else{
      text = "Invalid syscall: " + a7;
      postMessage({type: "stdio", stdioNumber: 2, msg: text});
      return 0;
    }
  }
}

var syscall_emulator = new SyscallEmulator();
var intController = new InterruptionController();


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
  postGDBWaiting = 1;
  while(1){
    try{
      xhr.open("GET", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
      xhr.send(null);
      if(xhr.status === 200){
        return xhr.responseText;
      }
    }catch(e){
      if(postGDBWaiting){
        postMessage({type: "output", subtype: "info", msg: "Waiting for GDB..."});
        postGDBWaiting = 0;
      }
    }
  }
}

var xhrS = new XMLHttpRequest();
function sendDebugMsg(msg){
  postGDBWaiting = 1;
  while(1){
    try {
      xhrS.open("POST", "http://127.0.0.1:5689/gdbInput", false);  // synchronous request
      xhrS.send(msg);
      if(xhrS.status === 200){
        return;
      }
    } catch (error) {
      if(postGDBWaiting){
        postMessage({type: "output", subtype: "info", msg: "Waiting for GDB..."});
        postGDBWaiting = 0;
      }
    }
  }
}

var Module = {
  // arguments : ["--version"],
  arguments : ["--newlib", "/working/ex2", "--isa", "acdfimsu", "--setreg", "sp=0x10000"],
  preRun : [initFS],
  print : function (text) {postMessage({type: "stdio", stdioNumber: 1, msg: text});},
  printErr : function (text) {postMessage({type: "stdio", stdioNumber: 2, msg: text});}
};
