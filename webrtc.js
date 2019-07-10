//var server     = { urls: "stun:stun.l.google.com:19302" };
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };
var pc = new RTCPeerConnection(null);
var dc;
pc.oniceconnectionstatechange = function(e) {
  var state = pc.iceConnectionState;
  console.log("Connection state: ", state);
};

pc.onicecandidate = function(e) {
  if (e.candidate) return;
  console.log("SDP: ", JSON.stringify(pc.localDescription));
};

pc.ondatachannel  = function(e) {
  dc = e.channel; 
  dcInit(dc);
};

function createOfferSDP() {
  dc = pc.createDataChannel("chat");
  pc.createOffer().then(function(e) {
    pc.setLocalDescription(e);
  });
  dc.onopen = function(){
    console.log("CONNECTED!");
  };
  dc.onmessage = function(e) {
    if (e.data) console.log("Message ",  e.data);
  };
}

function createAnswerSDP(creater_sdp) {
  var offerDesc = new RTCSessionDescription(creater_sdp);
  pc.setRemoteDescription(offerDesc);
  pc.createAnswer(function (answerDesc) {
    pc.setLocalDescription(answerDesc);
  }, function () {console.warn("Couldn't create offer");},
  sdpConstraints);
}

function start(answerSDP) {
  var answerDesc = new RTCSessionDescription(JSON.parse(answerSDP));
  pc.setRemoteDescription(answerDesc);
}

// createOfferSDP();

var sendMSG = function(m) {
  var value = m;
  if (value) {
    dc.send(value);
  }
};

function dcInit(dc) {
  dc.onopen    = function()  {
    console.log("CONNECTED!");
  };
  dc.onmessage = function(e) {
    if (e.data) console.log("Message ",  e.data);
  };
}