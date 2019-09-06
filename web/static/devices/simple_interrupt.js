/*jshint esversion: 6 */

export default class SimpleInterrupt{
  constructor(simulator){
    this.simulator = simulator;
    this.html =`
    <div class="card-body">
      <h5 class="card-title">External Interrupt</h5>
      <p class="card-text">
        Machine external interrupt
        <br>
        MIP: <span id="interrupt_status" class="badge badge-secondary">False (initial)</span>
      </p>
      <input name="Trigger Interrupt" id="interrupt_trigger" class="btn btn-primary" type="button" value="Trigger Interrupt">
      
    </div>
    `;
    this.HTMLstatus = "teste";
  }

  html_setup(){
    document.getElementById("interrupt_trigger").onclick = this.trigger;
    document.getElementById("interrupt_trigger").device = this;
    this.HTMLstatus = document.getElementById("interrupt_status");
  }


  trigger(){
    this.device.simulator.setInterruptState(1);
    this.device.HTMLstatus.innerHTML = "True (triggered)";
    this.device.HTMLstatus.setAttribute("class", "badge badge-success");
  }

  setup(){

  }

}