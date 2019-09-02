/*jshint esversion: 6 */
import {RISCV_Simulator} from "./simulator_controller.js";

var sim = new RISCV_Simulator(document.getElementById("codeSelector"), outputFunction);
sim.stdioBind(function() { // STDIN
                return document.getElementById("stdin").value;
              },
              function(s) { // STDOUT
                document.getElementById("stdout").scrollTop = document.getElementById("stdout").scrollHeight;
                document.getElementById("stdout").value += s + "\n";
                outputFunction("STDOUT", s);
              },
              function(s) { // STDERR
                document.getElementById("stderr").scrollTop = document.getElementById("stderr").scrollHeight;
                document.getElementById("stderr").value += s + "\n";
                outputFunction("STDERR", s);
              });


var outHTML = document.getElementById("general_output");
function outputFunction(type, msg){
  outHTML.scrollTop = outHTML.scrollHeight;
  outHTML.innerHTML += "[" + type + "]" + msg + "\n";
}

function loadParameters(){
  var param = [];
  if(document.getElementById("gdb_switch").checked) param.push("--gdb");
  if(document.getElementById("newlib_switch").checked) param.push("--newlib");
  param.push("/working/" + document.getElementById("codeSelector").files[0].name);
  param.push("--isa");
  var ISAs = "";
  if(document.getElementById("config_isaA").checked) ISAs += "a";
  if(document.getElementById("config_isaC").checked) ISAs += "c";
  if(document.getElementById("config_isaD").checked) ISAs += "d";
  if(document.getElementById("config_isaF").checked) ISAs += "f";
  if(document.getElementById("config_isaI").checked) ISAs += "i";
  if(document.getElementById("config_isaM").checked) ISAs += "m";
  if(document.getElementById("config_isaS").checked) ISAs += "s";
  if(document.getElementById("config_isaU").checked) ISAs += "u";
  param.push(ISAs);
  param = param.concat(document.getElementById("config_cmdline").value.trim().split(" ").filter(function (el) {
    return el != null;
  }));
  return param;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


class MMIO_Monitor{
  constructor(sim){
    this.sim = sim;
    this.addressList = [];
    this.int8memory = new Uint8Array(this.sim.mmio);
    this.int16memory = new Uint16Array(this.sim.mmio);
    this.int32memory = new Uint32Array(this.sim.mmio);
    document.getElementById("mmio_add").onclick = this.addHTML;
    document.getElementById("mmio_remove").onclick = this.removeHTML;
    document.getElementById("mmio_set8").onclick = this.set8;
    document.getElementById("mmio_set16").onclick = this.set16;
    document.getElementById("mmio_set32").onclick = this.set32;
    document.getElementById("mmio_set").onclick = this.set32;
  }

  set8() {
    var address = parseInt(document.getElementById("mmio_set_address").value) & 0xFFFF;
    var value = parseInt(document.getElementById("mmio_set_value").value) & 0xFF;
    Atomics.store(mmioMonitor.int8memory, address, value);
    mmioMonitor.add(address);
  }

  set16() {
    var address = parseInt(document.getElementById("mmio_set_address").value) & 0xFFFF;
    var value = parseInt(document.getElementById("mmio_set_value").value) & 0xFFFF;
    Atomics.store(mmioMonitor.int16memory, address >> 1, value);
    mmioMonitor.add(address);
  }

  set32() {
    var address = parseInt(document.getElementById("mmio_set_address").value) & 0xFFFF;
    var value = parseInt(document.getElementById("mmio_set_value").value) & 0xFFFFFFFF;
    Atomics.store(mmioMonitor.int32memory, address >> 2, value);
    mmioMonitor.add(address);
  }

  addHTML(){
    var address = parseInt(document.getElementById("mmio_add_address").value);
    mmioMonitor.add(address);
  }

  removeHTML(){
    var address = parseInt(document.getElementById("mmio_add_address").value);
    mmioMonitor.remove(address);
  }

  add(address) {
    var index = mmioMonitor.addressList.indexOf(address & 0xFFFF);
    if (index == -1) {
      mmioMonitor.addressList.push(address & 0xFFFF);
    }
  }

  remove(address){
    var index = mmioMonitor.addressList.indexOf(address & 0xFFFF);
    if (index > -1) {
      mmioMonitor.addressList.splice(index, 1);
    }
  }

  mmioMonitoring(){
    var data = ""; 
    for (var i in mmioMonitor.addressList) {
      var address = mmioMonitor.addressList[i];
      var value = Atomics.load(mmioMonitor.int32memory, address  >> 2);
      data += "Memory[" + address.toString(16) +"]: {" + (value >> 24).toString(16) + ", " + 
                                                        ((value >> 16) & 0xff).toString(16) + ", " + 
                                                        ((value >> 8) & 0xff).toString(16) + ", "  +
                                                        ((value) & 0xff).toString(16) + "}\n";
    }
    document.getElementById("mmio_area").innerHTML = data;
  }

  start(){
    if(typeof SharedArrayBuffer != "undefined"){
      mmioMonitor.int8memory = new Uint8Array(mmioMonitor.sim.mmio);
      mmioMonitor.int16memory = new Uint16Array(mmioMonitor.sim.mmio);
      mmioMonitor.int32memory = new Uint32Array(mmioMonitor.sim.mmio);
      mmioMonitor.timer = setInterval(mmioMonitor.mmioMonitoring, 500);
    }
  }

  stop(){
    clearInterval(mmioMonitor.timer);
  }
}

var mmioMonitor = new MMIO_Monitor(sim);

var sim_running = false;
document.getElementById("run_button").onclick = function(){
  if(sim_running){
    sim.stop();
    document.getElementById("stdin").readOnly = false;
    run_button.innerHTML = "Run";
    run_button.setAttribute("class", "btn btn-outline-success");
    sim_running = false;
    mmioMonitor.stop();
  }else{
    sim_running = true;
    var args = loadParameters();
    sim.setArgs(args);
    document.getElementById("stdin").readOnly = true;
    if(document.getElementById("clean_switch").checked){
      document.getElementById("stdout").value = "";
      document.getElementById("stderr").value = "";
    }
    sim.run(); 
    run_button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Stop';
    run_button.setAttribute("class", "btn btn-danger");
    mmioMonitor.start();
  }
};

codeSelector.onchange = function(){
  if(codeSelector.files.length){
    label_codeSelector.innerHTML = codeSelector.files[0].name;
    run_button.setAttribute("class", "btn btn-outline-success");
  }else{
    run_button.setAttribute("class", "btn btn-outline-secondary");
    label_codeSelector.innerHTML = "Choose file";
  }
};


document.getElementById("stdin_upload").onclick = function(){
  document.getElementById("stdin_file_input").click();
};

document.getElementById("stdin_file_input").onchange = function(){
  if(document.getElementById("stdin_file_input").files.length){
    var file = document.getElementById("stdin_file_input").files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      document.getElementById("stdin").value = evt.target.result;
    };
    reader.onerror = function (evt) {
      console.log("error reading file", evt);
    };
  }
};

document.getElementById("stdin_clean").onclick = function(){
  document.getElementById("stdin").value = "";
};

document.getElementById("stdout_download").onclick = function(){
  download("stdout.txt", document.getElementById("stdout").value);
};

document.getElementById("stdout_clean").onclick = function(){
  document.getElementById("stdout").value = "";
};

document.getElementById("stderr_download").onclick = function(){
  download("stderr.txt", document.getElementById("stderr").value);
};

document.getElementById("stderr_clean").onclick = function(){
  document.getElementById("stderr").value = "";
};



