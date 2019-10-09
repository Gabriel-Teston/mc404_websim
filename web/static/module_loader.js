/*jshint esversion: 9*/

export class Device{
  constructor(sim, setHMTL, setBigArea){
    this.simulator = sim;
    this.setHMTL = setHMTL;
    this.setBigArea = setBigArea;
  }

  addCard(code){
    this.setHMTL(code);
  }

  loadScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort && callback) setTimeout(callback, 0);
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
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
  constructor(sim, html, html_big_area){
    this.moduleList = ["simple_interrupt.js", "midi_synthesizer.js", "cleaner_robot.js"];
    // this.moduleList = ["simple_interrupt.js"];
    this.sim = sim;
    this.html = html;
    this.html_big_area = html_big_area;
  }

  loadAll(){
    for(var i in this.moduleList){
      this.load(this.moduleList[i], this.sim, this.html, this.html_big_area);
    }
  }

  async load(name, sim, html, html_big_area){
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

    var setBigArea = function(src, id){
      html_big_area.insertAdjacentHTML('beforeend', `
        <iframe src="${src}" id="${id}" frameborder="0" style="width:100%;height:100%;"></iframe>
      `);
      html_big_area.style = "display:block;";
    };

    var device = new module.default(sim, setHTML, setBigArea);
    sim.addDevice(device);
  }
}