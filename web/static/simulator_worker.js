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
    case "interactive":
      interactiveBuffer = new Uint8Array(e.data.vec);
      break;
    case "interrupt":
      intController.setMemoryTrigger(e.data.vec);
      break;
  }
};

class MMIO{
  constructor(sharedBuffer, bc){
    this.memory = [];
    this.memory[1] = new Uint8Array(sharedBuffer);
    this.memory[2] = new Uint16Array(sharedBuffer);
    this.memory[4] = new Uint32Array(sharedBuffer);
    this.size = sharedBuffer.byteLength;
    this.broadcastChannel = new BroadcastChannel('mmio_broadcast');
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
    this.broadcastChannel.postMessage({type: "write", addr: ((0xFFFF0000 | addr) >>> 0), size, value});
  }
}

class InterruptionController{
  constructor(){
    this.state = 0;
  }

  setMemoryTrigger(vec){
    this.memoryTrigger = new Uint8Array(vec);
  }

  changeState(state){
    this.state = state;
  }

  get interrupt(){
    return Atomics.compareExchange(this.memoryTrigger, 0, 1, 0);
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
      return a0;
    }else{
      var text = "Invalid syscall: " + a7;
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

function getInteractiveCommand (){
  while(1){
    if(Atomics.load(interactiveBuffer, 0) == 1 ){
      var i = 1;
      var string = "";
      var c = Atomics.load(interactiveBuffer, i);
      while(c != 0){
        string += String.fromCharCode(c);
        i++;
        c = Atomics.load(interactiveBuffer, i);
      }
      Atomics.store(interactiveBuffer, 0, 0);
      return string;
    }
  }
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
