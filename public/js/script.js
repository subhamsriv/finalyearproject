// Use the same keys that you are going to use for Arduino code with Johnny-Five

var pubnub = PUBNUB.init({
  publish_key: 'pub-c-644a2beb-2a6c-457c-b59e-b9ae02e84a58', // Use your pub key
  subscribe_key: 'sub-c-07a0f7bc-1dca-11e7-894d-0619f8945a4f' // Use your sub key
});

// Use the same channel name
var channel = 'led';

var forward = document.getElementById("button-forward");
var left = document.getElementById("button-left");
var right = document.getElementById("button-right");
var backward = document.getElementById("button-backward");
var stop=    document.getElementById("button-stop");
var detect = document.getElementById("button-detection");
var detectioninfo = document.getElementById("detectioninfo");
var forwardState = true;
var leftState = true;
var rightState = true;
var backwardState = true;
var stopState = true;
var detectState = true;

detect.addEventListener("click",function(e){
      detection();
});
     function detection() {
      var video = document.getElementById('video');
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');

      tracking.ColorTracker.registerColor('red', function(r, g, b) {
          if (r >200 && g<100 && b < 90) {
          return true;
           }
          return false;
           });
      var tracker = new tracking.ColorTracker(['red']);
      tracking.track('#video', tracker, { camera: true });
      var j=0;
      var i=0;

      tracker.on('track', function(event) {
        if(event.data.length == 0){
        i=0;
        j=0;
        detectioninfo.innerHTML = "You can move now";
       }
        context.clearRect(0, 0, canvas.width, canvas.height);
        forward.disabled = false;
        backward.disabled = false;
        left.disabled = false;
        right.disabled = false;

        if(event.data.length != 0){
          if(i==j){
             detectioninfo.innerHTML = "Red Detected, Car is Stopped";
             pubnub.publish({
             channel: channel,
             message: {sstate: stopState,
                      dstate: detectState
                    },
             callback: function(m) {
                    console.log(m);
                     }
                  });
               }
          j=+1;
          
          event.data.forEach(function(rect) {
                 
           forward.disabled = true;
           backward.disabled = true;
           left.disabled = true;
           right.disabled = true;
            

          context.strokeStyle = rect.color;
          context.strokeRect(rect.x, rect.y, rect.width, rect.height);
          context.font = '11px Helvetica';
          context.fillStyle = "#fff";
          context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
          context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });
              }
      });
  


     
    };




pubnub.subscribe({
  channel: channel,
  message: function(m) {
    if(m.data){
    var table = document.getElementById("infotable");
    var row = table.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = m.data.starttime;
    cell2.innerHTML = m.data.stoptime;
    cell3.innerHTML = m.data.reason;
  }

  }
});

/*
Upon a button click, publish the data.
Arduino will subscribe it 
*/
forward.addEventListener('click', function(e) {
  
  pubnub.publish({
    channel: channel,
    message: {fstate: forwardState},
    callback: function(m) {
      console.log(m);
    }
  });

});
left.addEventListener('click', function(e) {
  pubnub.publish({
    channel: channel,
    message: {lstate: leftState},
    callback: function(m) {
      console.log(m);
    }
  });

});
right.addEventListener('click', function(e) {
  pubnub.publish({
    channel: channel,
    message: {rstate: rightState},
    callback: function(m) {
      console.log(m);
    }
  });

});
backward.addEventListener('click', function(e) {
  pubnub.publish({
    channel: channel,
    message: {bstate: backwardState},
    callback: function(m) {
      console.log(m);
    }
  });

});
stop.addEventListener('click', function(e) {
    pubnub.publish({
          channel: channel,
          message: {sstate: stopState},
          callback: function(m) {
          console.log(m);
         }
    });
});