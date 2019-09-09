/*jshint esversion: 6 */
import {Device} from "../module_loader.js";

export default class MIDI_Synthesizer extends Device{
  constructor(...args){
    super(...args);
    this.addCard(`
    <div class="card-body">
      <h5 class="card-title">Sound Synthesizer</h5>
      <p class="card-text">
        16-channel MIDI sound synthesizer <br>
        <span class="badge badge-secondary">Disabled</span>
      </p>
      <a href="#" class="btn btn-primary">Load Device</a>
    </div>
    `);
  }

  setup(){

  }

}