var five     = require('johnny-five');
var path     = require('path');
var express  = require('express');
var moment   = require("moment");
var mongoose = require("mongoose");


var board = new five.Board();

const publicPath = path.join(__dirname, '/public');
const port = process.env.PORT || 3000;
var app = express();
app.set("view engine", "ejs");
app.use(express.static(publicPath));
mongoose.connect("mongodb://subham:ahiritola@ds115071.mlab.com:15071/collegeproject",function(err){
    if(err){
        console.log(err);
        
    }else{
        console.log("connected to database");
    }
    
});


var pubnub = require('pubnub').init({
  publish_key: "pub-c-644a2beb-2a6c-457c-b59e-b9ae02e84a58", // Use your pub key
  subscribe_key: 'sub-c-07a0f7bc-1dca-11e7-894d-0619f8945a4f' // Use your sub key
});


var channel = 'led';
var date = new Date();
var time = date.getTime();
var startTime,stopTime,reasonStop;
var startTimestatus = false;


console.log(moment(time).format('MMMM Do YYYY, h:mm:ss a'));


var infoSchema = new mongoose.Schema({
  stoptime: String,
  starttime: String,  
  reason  : String,
  
  },
  { timestamps: { createdAt: 'created_at' } }
);
var Timeinfo = mongoose.model("Timeinfo", infoSchema);

board.on("ready", function() {
  console.log("Ready event. Repl instance auto-initialized!");

var ledleft1  = new five.Led(6);
var ledleft2= new five.Led(7);
var ledright1= new five.Led(2);
var ledright2= new five.Led(3);
var leddetect= new five.Led(12);

// pin mode constants are available on the Pin class
this.pinMode(9, five.Pin.PWM);
this.analogWrite(9, 60);
this.pinMode(10, five.Pin.PWM);
this.analogWrite(10, 55);

  //this.pinMode(4, five.Pin.OUTPUT);
pubnub.subscribe({
    channel: channel,
    message: function(m) {
      if(m.fstate === true) {
          console.log("m.fstate");
          console.log(m.fstate);
          ledleft1.off();
          ledleft2.on();
          ledright1.off();
          ledright2.on();
          leddetect.off();
          if(!startTimestatus){
             var f = new Date();
             var x = f.getTime();
             startTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
             console.log(startTime);
             startTimestatus= true;
          }
      }
      if(m.bstate === true) {
          console.log("m.bstate");
          console.log(m.bstate);
          ledleft1.on();
          ledleft2.off();
          ledright1.on();
          ledright2.off();
          leddetect.off();
          if(!startTimestatus){
             var b = new Date();
             var x = b.getTime();
             startTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
             console.log(startTime);
             startTimestatus= true;
          }
      }
      if(m.rstate === true) {
          console.log("m.rstate");
          console.log(m.rstate);
          ledleft1.off();
          ledleft2.on();
          ledright1.off();
          ledright2.off();
          leddetect.off();
          if(!startTimestatus){
            var r = new Date();
            var x = r.getTime();
            startTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
            console.log(startTime);
            startTimestatus= true;
          }
      }
      if(m.lstate === true) {
          console.log("m.lstate");
          console.log(m.lstate);
        ledright1.off();
        ledright2.on();
        ledleft1.off();
       ledleft2.off();
       leddetect.off();
       if(!startTimestatus){
       var l = new Date();
       var x = l.getTime();
       startTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
       console.log(startTime);
       startTimestatus= true;
     }

 }
    if(m.sstate==true || m.dstate==true ){

       if(m.sstate === true) {
          console.log("m.sstate");
          console.log(m.sstate);
        ledright1.off();
        ledright2.off();
        ledleft1.off();
       ledleft2.off();
       startTimestatus = false;
       var s = new Date();
       var x = s.getTime();
       stopTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
       console.log(stopTime);
        reasonStop = "stop button pressed";
       console.log(reasonStop);

      }
      if(m.dstate === true) {
          console.log("m.dstate");
          console.log(m.dSstate);
        leddetect.on();
        var s = new Date();
       var x = s.getTime();
       stopTime = moment(x).format('MMMM Do YYYY, h:mm:ss a');
       console.log(stopTime);
        reasonStop = "red detected";
       console.log(reasonStop);
      }
      var info = new Timeinfo();
      info.starttime= startTime;
      info.stoptime = stopTime;
      info.reason   = reasonStop;
      info.save(function(err,user){
        if(err){
          console.log(err)
        }else{
          console.log(user);
          pubnub.publish({
            channel: channel,
            message : {data: user},
            callback : function(m){
              console.log("table udated");
            }

          });
        }
      });
}

      
    },
    error: function(err) {console.log(err);}
  });
function query(){
  Timeinfo.find(
  {$and:[{created_at : { $gte : new Date().getTime()-1000*60*1} },
               {created_at : { $lte : new Date().getTime()}}]
       },function(err, docs){
    if(err){
      console.log(err);
    }else{
     console.log(docs);
     var countRed=0,countStop=0;
     for(var i=0;i<docs.length;i++){
      if(docs[i].reason=="red detected"){
          countRed+=1;
      }else{
        countStop+=1;
      }
     }
     if(countStop>=10)  {
      console.log("Heavy Congestion");
    }
      else if(countStop>=6 && countStop<=9) {
        console.log("Moderate Congestion");
      }
      else if(countStop<=5) {
        console.log("Low Congestion");
      }


        
     
     console.log(countStop);
     console.log(countRed);
   }
     
    }
  );
}
setInterval(query, 1000*60*1);
      
  
    



  
 });


app.listen(3000,function(){
  console.log("server has started");
});




