/*jshint esversion: 9 */
import {Device} from "../module_loader.js";

export default class MIDI_Synthesizer extends Device{
  constructor(...args){
    super(...args);
    this.addCard(`
    <div class="card-body">
      <h5 class="card-title">Sound Synthesizer</h5>
      <p class="card-text">
        16-channel MIDI sound synthesizer <br>
        <span id="status_midi_synth" class="badge badge-secondary">Disabled</span>
      </p>
      <a href="#" id="load_midi_synth" class="btn btn-primary">Load Device</a>
    </div>
    `);
    document.getElementById("load_midi_synth").onclick = this.load;
    document.getElementById("load_midi_synth").device = this;
    this.HTMLstatus = document.getElementById("status_midi_synth");
  }

  async load(){
    var module = await import("../third-party/webaudio-tinysynth.js");
    this.device.synth = new module.Player();
    this.device.HTMLstatus.innerHTML = "Enabled";
    this.device.HTMLstatus.setAttribute("class", "badge badge-success");
    this.device.setup();
  }

  onmessage(reg){
    this.synth.play(reg.a0, reg.a1 >> 24, ((reg.a1 >> 16)&0xFF)/256, 0, (reg.a1 & 0xFFFF)/1000, reg.a2);
  }

  setup(){
    if(this.synth == undefined){
      return;
    }
    var syscall =`
      sendMessage({a0, a1, a2});
    `;
    this.simulator.registerSyscall(2048, syscall, this);
  }

}