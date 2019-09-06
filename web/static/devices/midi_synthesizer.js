/*jshint esversion: 6 */

export default class MIDI_Synthesizer{
  constructor(simulator){
    this.simulator = simulator;
    this.html =`
    <div class="card-body">
      <h5 class="card-title">Sound Synthesizer</h5>
      <p class="card-text">
        16-channel MIDI sound synthesizer <br>
        <span class="badge badge-secondary">Disabled</span>
      </p>
      <a href="#" class="btn btn-primary">Load Device</a>
    </div>
    `;
  }
  
  html_setup(){

  }

  setup(){

  }

}