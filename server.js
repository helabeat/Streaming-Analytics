var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
const dateTime = require('date-time');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extented: true
}));
//connection configuration
var dbConn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'music_app'
});

//connect to database
dbConn.connect();
//default route
app.get('/', function(req, res){
	return res.send({ error: true, message: 'hello'})
});
//Add a new analytics
app.post('/analytics', function (req, res){
	let analytics = req.body;
	let user_id = req.body.user_id;
	let song_id = req.body.song_id;
	let session_id = req.body.session_id;
	var count=1;
	let date = dateTime();
	let currentdate = new Date();
	let hours = currentdate.getHours();
	let minutes = currentdate.getMinutes();
	let time = hours+":"+minutes;
	let day = currentdate.getDay();

	var someVar;

	let query = dbConn.query('SELECT count FROM analytics where user_id = ? and song_id = ?', [user_id, song_id], function(error, results, fields){
		if(error) throw error;
		console.log(results);
		let size = results.length;
		if(size == 0){
			if(!analytics){
			return res.status(400).send({ error:true, message: 'Please provide data' });
			}
			dbConn.query("INSERT INTO analytics SET ? ", { user_id:user_id, song_id:song_id, count:count, last_date:date }, function(error, results, fields){
				if(error) throw error;
				return res.send({ error:false, data: results, message: 'created successfully'});
			});
		}
		else{
			obj = JSON.parse(JSON.stringify(results));
			obj.forEach(function(element){
				count=element.count;
				console.log(count);
				count = count +1;
				console.log(count);
				dbConn.query("UPDATE analytics SET count = ?, last_date = ? where user_id = ? and song_id = ?",[count,date,user_id,song_id], function (error, results, fields){
					if (error) throw error;
					return res.send({ error: false, data: results, message: 'updated successfully.'});
				});
			});
		}
	});

	//console.log(time);
	//console.log(day);

	dbConn.query("INSERT INTO user_analytics SET ? ", {user_id:user_id, song_id:song_id, time:time, day:day }, function(error, results, fields){
		if(error) throw error;
		//return res.send({ error:false, data: results, message: 'inserted successfully'});
	});

	let song_count = 1;

	let query1 = dbConn.query("SELECT count from songs where song_id = ?", song_id, function(error, results, fields){
		if(error) throw error;

		let len = results.lenght;
		if(len==0){
			dbConn.query("INSERT INTO songs SET ?", {song_id:song_id, count:song_count, last_date:date}, function(error, results, fields){
				if(error) throw error;

			});
		}
		else{
			song_obj = JSON.parse(stringify(results));
			song_obj.forEach(function(element){
				song_count=element.count;
				song_count=song_count+1;
				dbConn.query("UPDATE songs SET count=?, last_date=? where song_id=?", [song_count, date, song_id], function(error, results, fields){
					if(error) throw error;
				});
			});
		}
	});

	dbConn.query("INSERT INTO session_data SET ? ", { session_id:session_id, item_id:song_id, time:time }, function(error, results, fields){
		if(error) throw error;
	});

});
app.listen(3000, function(){
	console.log('Node app is running on port 3000');
});
module.exports = app;