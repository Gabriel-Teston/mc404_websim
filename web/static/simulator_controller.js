/*jshint esversion: 6 */

export class RISCV_Simulator{

  constructor(HTMLFileList, outputFunction=null, sharedArraySize=0x10000){
    this.HTMLFileList = HTMLFileList;
    this.outputFunction = outputFunction;
    this.stdioHandler = [];
    this.sharedArraySize = sharedArraySize;
    this.devices = [];
    this.syscalls = [];
    this.startWorker();
  }

  startWorker(){
    this.w = new Worker("simulator_worker.js");
    this.w.controller = this;
    this.w.onmessage = function(e){
      if(!e.data.type){
        console.log("w: " + e.data);
        return;
      }
      switch(e.data.type){
        case "stdio":
          if(this.controller.stdioHandler.length != 0){
            this.controller.stdioHandler[e.data.stdioNumber](e.data.msg);
          }else{
            console.log(e.data);
          }
          break;
        case "output":
          if(this.controller.outputFunction){
            this.controller.outputFunction(e.data.subtype, e.data.msg);
          }else{
            console.log(e.data);
          }
          break;
        case "device_message":
          this.controller.syscalls[e.data.syscall].onmessage(e.data.message);
          break;
        default:
          console.log("w: " + e.data);
      }
    };
    if(typeof SharedArrayBuffer != "undefined"){
      this.mmio = new SharedArrayBuffer(this.sharedArraySize);
      this.w.postMessage({type: "mmio", vec: this.mmio});
    }
    this.devices.map(function(x){x.setup();});
  }

  addDevice(obj){
    this.devices.push(obj);
  }

  setArgs(args){
    this.w.postMessage({type: "set_args", vec: args});
  }

  run(){
    if(this.stdioHandler[0]){
      this.stdin = this.stdioHandler[0]();
    }
    this.w.postMessage({type: "code_load", code: this.HTMLFileList.files});
    this.w.postMessage({type: "start_sim"});
  }

  stop(){
    this.w.terminate();
    this.startWorker();
  }

  stdioBind(stdin, stdout, stderr){
    this.stdioHandler[0] = stdin;
    this.stdioHandler[1] = stdout;
    this.stdioHandler[2] = stderr;
  }

  registerSyscall(number, syscall_code, syscall_handler){
    if(syscall_handler != undefined){
      this.syscalls[number] = syscall_handler;
    }
    this.w.postMessage({type: "syscall", num: number, code: syscall_code});
  }

  setInterruptState(s){
    this.w.postMessage({type: "interrupt", state: s});
  }

  get stdin(){
    throw("STDIN is write-only");
  }

  set stdin(s){
    this.w.postMessage({type: "stdin", stdin: s});
  }
}
