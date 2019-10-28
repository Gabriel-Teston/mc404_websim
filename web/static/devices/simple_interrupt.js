/*jshint esversion: 6 */
import {Device} from "../module_loader.js";

export default class SimpleInterrupt extends Device{
  constructor(...args){
    super(...args);
    this.addCard(`
    <div class="card-body">
      <h5 class="card-title">External Interrupt</h5>
      <p class="card-text">
        Machine external interrupt
        <br>
        MIP: <span id="interrupt_status" class="badge badge-secondary">False (initial)</span>
      </p>
      <input name="Trigger Interrupt" id="interrupt_trigger" class="btn btn-primary" type="button" value="Trigger Interrupt">  
    </div>
    `);
    document.getElementById("interrupt_trigger").onclick = this.trigger.bind(this);
    this.HTMLstatus = document.getElementById("interrupt_status");
    this.broadcastChannel = new BroadcastChannel('mmio_broadcast');
    this.broadcastChannel.onmessage = this.mmioHandler.bind(this);
  }

  mmioHandler(bc_msg){
    var msg = bc_msg.data;
    if(msg.type == "write"){
      if(msg.addr == 0xFFFF0104){ // gpt
        if(msg.value == 0 && this.gpt_timer != undefined){
          clearTimeout(this.gpt_timer);
        }else{
          this.gpt_timer = setTimeout(this.gpt_trigger.bind(this), msg.value);
        }
      }else if(msg.addr == 0xFFFF0108 && msg.value == 1){ // UART write
        var ch = String.fromCharCode(this.simulator.mmio.load(0xFFFF0109, 1));
        this.simulator.stdioHandler[1](ch, "");
        this.simulator.mmio.store(0xFFFF0108, 1, 0);
      }else if(msg.addr == 0xFFFF010A && msg.value == 1){ // UART read
        var ch = this.simulator.stdioHandler[0]().charCodeAt(this.stdinCounter);
        if(ch == NaN){
          ch = 0;
        }
        this.simulator.mmio.store(0xFFFF010B, 1, ch);
        this.stdinCounter += 1;
        this.simulator.mmio.store(0xFFFF010A, 1, 0);
      }
    }
  }


  gpt_trigger(){
    this.simulator.setInterruptState(1);
  }

  trigger(){
    this.simulator.setInterruptState(1);
    this.HTMLstatus.innerHTML = "True (triggered)";
    this.HTMLstatus.setAttribute("class", "badge badge-success");
  }

  setup(){
    this.stdinCounter = 0;
    if(this.gpt_timer != undefined){
      clearTimeout(this.gpt_timer);
    }
  }
}