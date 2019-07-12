/*jshint esversion: 6 */

class RISCV_Simulator{

  constructor(HTMLFileList, outputFunction=null){
    this.HTMLFileList = HTMLFileList;
    this.outputFunction = outputFunction;
    this.stdioHandler = [];
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
        default:
          console.log("w: " + e.data);
      }
    };
  }



  run(){
    if(this.stdioHandler[0]){
      this.stdin = this.stdioHandler[0]();
    }
    this.w.postMessage({type: "code_load", code: this.HTMLFileList.files});
    this.w.postMessage({type: "start_sim"});
  }

  restart(){
    this.w.terminate();
    this.startWorker();
  }

  stdioBind(stdin, stdout, stderr){
    this.stdioHandler[0] = stdin;
    this.stdioHandler[1] = stdout;
    this.stdioHandler[2] = stderr;
  }

  get stdin(){
    throw("STDIN is write-only");
  }

  set stdin(s){
    this.w.postMessage({type: "stdin", stdin: s});
  }
}