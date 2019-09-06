/*jshint esversion: 9*/

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
    var device = new module.default(sim);
    html.insertAdjacentHTML('beforeend', `
    <div class="col-sm-4">
      <div class="card">
        ${device.html}
      </div>
    </div>
    `); 
    sim.addDevice(device);
    device.html_setup();
  }
}