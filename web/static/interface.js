/*jshint esversion: 6*/
import {RISCV_Simulator} from "./simulator_controller.js";
import {ModuleLoader} from "./module_loader.js";
var version_text = `version: d271048`;

var fileList = {files: []};
var sim = new RISCV_Simulator(fileList, outputFunction);
var moduleLoader = new ModuleLoader(sim, document.getElementById("devices_area"), document.getElementById("big_devices_area"));
moduleLoader.loadAll();

if(typeof SharedArrayBuffer == "undefined"){
  document.getElementById("browserAlert").style.display = "block";
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function(reg) {
      console.log('Successfully registered service worker', reg);
  }).catch(function(err) {
      console.warn('Error whilst registering service worker', err);
  });
}

var stdoutBuffer = "";
var stderrBuffer = "";

sim.stdioBind(function() { // STDIN
                return document.getElementById("stdin").value;
              },
              function(s, end) { // STDOUT
                if(end == undefined){
                  end = "\n";
                }
                stdoutBuffer += s + end;
              },
              function(s) { // STDERR
                stderrBuffer += s + "\n";
              });


function updateStdout(){
  document.getElementById("stdout").value = stdoutBuffer.slice(-1500);         
  document.getElementById("stdout").scrollTop = document.getElementById("stdout").scrollHeight;
  document.getElementById("stderr").value = stderrBuffer.slice(-1500);      
  document.getElementById("stderr").scrollTop = document.getElementById("stderr").scrollHeight;
}


var outHTML = document.getElementById("general_output");
function outputFunction(type, msg){
  outHTML.scrollTop = outHTML.scrollHeight;
  outHTML.innerHTML += "[" + type + "]" + msg + "\n";
}

function loadParameters(){
  var param = [];
  if(document.getElementById("gdb_switch").checked) param.push("--gdb");
  if(document.getElementById("interactive_switch").checked) param.push("--interactive");
  if(document.getElementById("newlib_switch").checked) param.push("--newlib");
  param.push("/working/" + fileList.files[0].name);
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
    return el != null && el != "";
  }));
  return param;
}

function download(filename, text) {
    var element = document.createElement('a');
    var url = URL.createObjectURL( new Blob( [text], {type:'text/plain'} ) );
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
}


class MMIO_Monitor{
  constructor(sim){
    this.sim = sim;
    this.addressList = [];
    this.int8memory = new Uint8Array(this.sim.mmio.sharedBuffer);
    this.int16memory = new Uint16Array(this.sim.mmio.sharedBuffer);
    this.int32memory = new Uint32Array(this.sim.mmio.sharedBuffer);
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
      mmioMonitor.int8memory = new Uint8Array(mmioMonitor.sim.mmio.sharedBuffer);
      mmioMonitor.int16memory = new Uint16Array(mmioMonitor.sim.mmio.sharedBuffer);
      mmioMonitor.int32memory = new Uint32Array(mmioMonitor.sim.mmio.sharedBuffer);
      mmioMonitor.timer = setInterval(mmioMonitor.mmioMonitoring, 250);
    }
  }

  stop(){
    clearInterval(mmioMonitor.timer);
  }
}

var mmioMonitor = new MMIO_Monitor(sim);

var stdoutTimeUpdate;
var sim_running = false;
document.getElementById("run_button").onclick = function(){
  if(sim_running){
    sim.stop();
    document.getElementById("stdin").readOnly = false;
    run_button.innerHTML = "Run";
    run_button.setAttribute("class", "btn btn-outline-success");
    sim_running = false;
    mmioMonitor.stop();
    clearInterval(stdoutTimeUpdate);
    clitools.filePending = false;
  }else{
    sim_running = true;
    if(clitools.filePending == false){
      fileList.files[0] = document.getElementById("codeSelector").files[0];
    }
    var args = loadParameters();
    sim.setArgs(args);
    document.getElementById("stdin").readOnly = true;
    if(document.getElementById("clean_switch").checked){
      stdoutBuffer = "";
      stderrBuffer = "";
      document.getElementById("stdout").value = "";
      document.getElementById("stderr").value = "";
    }
    sim.run(); 
    run_button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Stop';
    run_button.setAttribute("class", "btn btn-danger");
    mmioMonitor.start();
    stdoutTimeUpdate = setInterval(updateStdout, 250);
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

document.getElementById("interactive").oninput = function(){
  var s = document.getElementById("interactive");
  if(s.value.charAt(s.value.length-1) == "\n"){
    sim.setInteractiveBuffer(s.value);
    s.value = "";
  }
};

document.getElementById("gdb_switch").onchange = function(){
  var ua = navigator.userAgent.toLowerCase(); 
  if((ua.indexOf('firefox') > -1 || ua.indexOf('safari') > -1) && ua.indexOf('chrome') == -1){
    if (location.protocol == 'https:'){ 
      $("#gdbBrowser").modal('show');
    }
  }
};

document.getElementById("newlib_switch").onchange = function(){
  if(document.getElementById("newlib_switch").checked){
    document.getElementById("config_cmdline").value = "--setreg sp=0x7fffffc";
  }else{
    document.getElementById("config_cmdline").value = "";
  }
};

document.getElementById("stdin_clean").onclick = function(){
  document.getElementById("stdin").value = "";
};

document.getElementById("stdout_download").onclick = function(){
  download("stdout.txt", stdoutBuffer);
};

document.getElementById("stdout_clean").onclick = function(){
  stdoutBuffer = "";
  document.getElementById("stdout").value = "";
};

document.getElementById("stderr_download").onclick = function(){
  download("stderr.txt", stderrBuffer);
};

document.getElementById("stderr_clean").onclick = function(){
  stderrBuffer = "";
  document.getElementById("stderr").value = "";
};

class CLITools{
  constructor(sim){
    this.simulator = sim;
    this.filePending = false;
    this.xhr = new XMLHttpRequest();
    this.xhr.clitools = this;
    this.status = "initial";
    this.stdoutSentLength = 0;
    this.stderrSentLength = 0;
  }

  enable(){
    this.interval = setInterval(this.update.bind(this), 500);
  }

  disable(){
    clearInterval(this.interval);
  }

  run(){
    this.stdoutSentLength = 0;
    this.stderrSentLength = 0;
    document.getElementById("run_button").click();
    this.status = "running";
  }

  stop(){
    this.filePending = false;
    document.getElementById("run_button").click();
    this.status = "initial";
  }

  updateSTDIN(){
    this.xhr.open("GET", "http://127.0.0.1:8695/stdin", true);
    this.xhr.responseType = "text";
    this.xhr.onload = function( e ) {
      document.getElementById("stdin").value = this.xhr.responseText;
      this.status = "stdinReceived";
      this.run();
    }.bind(this);
    this.xhr.onerror = function( e ) {
      this.status = "initial";
    }.bind(this);
    this.xhr.send();
  }

  updateSTDOUT(){
    this.xhr.open("POST", "http://127.0.0.1:8695/stdout", true);
    this.xhr.responseType = "text";
    this.xhr.onload = function( e ) {
    };
    this.xhr.onerror = function( e ) {
      this.stop();
    }.bind(this);
    var stdoutCurrData = stdoutBuffer.slice(this.stdoutSentLength);
    var stderrCurrData = stderrBuffer.slice(this.stderrSentLength);
    this.xhr.send(JSON.stringify([stdoutCurrData, stderrCurrData]));
    this.stdoutSentLength = stdoutBuffer.length;
    this.stderrSentLength = stderrBuffer.length;
  }

  update(){
    if(this.status == "initial" && sim_running == false){
      this.xhr.open("GET", "http://127.0.0.1:8695/code", true);
      this.xhr.responseType = "blob";
      this.xhr.onload = function( e ) {
        var file = new File([this.xhr.response], "cli_code");
        fileList.files[0] = file;
        this.filePending = true;
        this.status = "fileReceived";
        this.updateSTDIN();
      }.bind(this);
      this.xhr.onerror = function( e ) {
        this.status = "initial";
      }.bind(this);
      this.xhr.send();
      this.status = "sent";
    }else if(this.status == "running"){
      this.updateSTDOUT();
    }
  }
}
var clitools = new CLITools(sim);

document.getElementById("cli_run_switch").onchange = function(){
  if(document.getElementById("cli_run_switch").checked){
    clitools.enable();
  }else{
    clitools.disable();
  }
};

window.onload = function(){
  if(document.getElementById("cli_run_switch").checked){
    clitools.enable();
  }
  document.getElementById("div_version").innerHTML = version_text;
};
