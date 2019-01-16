var socket = require('socket.io-client')('https://xxx.xxxx.com:8443');
var moment = require('moment-timezone');
var mysql = require('mysql');
var quotes = ['#Bitcoin'];

var type_quotes = 'standard'; // standard | eurica
var chartValues=0;
var askValues=0;
var bidValues=0;
var changeValues=0;
var recordcount=0;
var countersave=0
var records = [];
var cfordelete=0;
var minutesave=0;
var createtable=false;
var newdate,olddate="";//change the oldedate to the current date today YYYYMDD
var dropdate="";
var execute_once=0;

socket.on('connect', function(){
      console.info('connected');
      socket.emit('subscribe', quotes, type_quotes, 6); // cannot use morethan 6 argument no return data.
});

socket.on('quotes6', function(data) {
        console.info('quotes:', data.msg)
        askValues = parseFloat(data.msg.ask);
        bidValues = parseFloat(data.msg.bid);
        chartValues= (askValues + bidValues) / 2;		
		data.msg.tick=chartValues        
		save(data.msg);
});
socket.on('disconnect', function(){

});

function timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp * 1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
  //var time = date + ' ' + a.getMonth() + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    var time = year+ '' + (a.getMonth()+1) + '' + date ;
  return time;
}

function recreate(passingdate){
		var connection_re = mysql.createConnection({
		  host: "xxxxxxxxxxxxx",
		  user: "xxxxxxxxxxxx",
		  password: "xxxxxxxxxxxxxx",
		  database: "xxxxxxxxxxxx"
		});

		connection_re.connect(function(err) {
		  if (err){ 		  	
		  	  recreate(passingdate);
			  connection_re.end();	
		  }else{
		  	//console.log("Connected!");		
		  	var sql = "CREATE TABLE z_currencies_Bitcoin"+passingdate+" (`id` int(20) unsigned NOT NULL AUTO_INCREMENT,`symbol` text,`ask` text,`bid` text,`change` text,`digits` text,`lasttime` text,`tick` text,`row_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;";
		  	connection_re.query(sql, function (err, result) {
		    	if (err){
		    		recreate(passingdate);
			    	connection_re.end();		    			    		
		    	}
		    	connection_re.end();		    			 		
		  	});
		  }
		
	
		});

}

function save(arg){
	if(execute_once==0){
		olddate=timeConverter( (arg.lasttime) -1 * 24 * 60 * 60);
	}
	execute_once=1;

	minutesave=minutesave+1;

	var connection0 = mysql.createConnection({
	  host: "xxxxxxxxxxx",
	  user: "xxxxxxxxxxxxxxxxx",
	  password: "XXXXXXXXXXXXXXXXXXX",
	  database: "xxxxxxxxxxxx"
	});
	
	//connection.connect();	

			
	var datainsert = {
		ask:arg.ask,
        bid:arg.bid,
        change:arg.change,
        digits:arg.digits,
        lasttime:arg.lasttime,
        tick:arg.tick,
        symbol:arg.symbol
	};

	newdate=timeConverter(arg.lasttime);

	dropdate=timeConverter( (arg.lasttime) -30 * 24 * 60 * 60 );
   

	if(olddate!=newdate){
		createtable=true;
		olddate=newdate;
	}

	if (createtable){
		createtable=false;


			var connection3 = mysql.createConnection({
		  host: "xxxxxxxxx",
		  user: "xxxxxxxxxx",
		  password: "xxxxxxxxxxxx",
		  database: "xxxxxxxxxx"
		});

		
		connection3.connect(function(err) {
		  if (err){
		  
		  }else{
		  	console.log("Connected!");		
			var sql = "DROP TABLE IF EXISTS `z_currencies_Bitcoin"+dropdate+"`;";
			  connection3.query(sql, function (err, result) {
			    if (err){
					
			    }

			 	connection3.end();
			  });
		  }
		  	
		});

	}else{

		var query = connection0.query('INSERT INTO z_currencies_Bitcoin'+newdate+' SET ?', datainsert,
    	function(err, result) {
        	//console.log(result);	
        	connection0.end();
    		}
    	);
	}	

}
