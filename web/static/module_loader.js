/*jshint esversion: 9*/

export class Device{
  constructor(sim, setHMTL){
    this.simulator = sim;
    this.setHMTL = setHMTL;
  }

  addCard(code){
    this.setHMTL(code);
  }
  
  set html(code){
    this.setHMTL(code);
  }

  get html(){
    return "";
  }

  setup(){

  }
}

export class ModuleLoader{
  constructor(sim, html){
    this.moduleList = ["simple_interrupt.js", "midi_synthesizer.js"];
    // this.moduleList = ["simple_interrupt.js"];
    this.sim = sim;
    this.html = html;
  }

  loadAll(){
    for(var i in this.moduleList){
      this.load(this.moduleList[i], this.sim, this.html);
    }
  }

  async load(name, sim, html){
    var module = await import("./devices/" + name);
    var setHTML = function(code){
      html.insertAdjacentHTML('beforeend', `
      <div class="col-sm-4">
        <div class="card">
          ${code}
        </div>
      </div>
      `); 
    };
    var device = new module.default(sim, setHTML);
    sim.addDevice(device);
  }
}