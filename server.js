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
	var count=1;
	let date = dateTime();

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
});
app.listen(3000, function(){
	console.log('Node app is running on port 3000');
});
module.exports = app;