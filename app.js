var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');
const { title } = require('process');

var app = express();

//create client 
const client = redis.createClient();

client.on('connect', ()=>{
	console.log('Redis server connected out successfully .....');
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	client.lrange('task', 0, -1, (err, reply)=>{
		client.hgetall('call', (err, call)=>{ 
			const title = reply
			res.render('index', {
				title: title,
				tasks: reply,
				call: call
			})
		})
	})
});

app.post('/task/add', (req, res)=>{
	const taskToadd = req.body.task
	console.log(taskToadd)
	client.rpush("task",taskToadd, (err, reply)=>{
		if(err){
			console.log(err.message)
		}
		console.log(' a task was added to the db');
		res.redirect('/')
	})	
})

app.post('/task/delete', (req, res)=>{
	const taskToDelete = req.body.tasks;
	console.log(taskToDelete)
	client.lrange('task', 0, -1, (err, tasks)=>{
		for(let i = 0; i < tasks.length; i ++){
			if(taskToDelete.indexOf(tasks[i]) > -1){
				console.log('this is the index', tasks.indexOf(taskToDelete))
				client.lrem('task', 0, tasks[i], ()=>{
					if(err){
						console.log(err.message);
					}
				})
			}
		}
		res.redirect('/')
	})
})
app.post('/call/add', (req, res)=>{
	const newCall = {}
	newCall.name = req.body.name;
	newCall.company = req.body.company;
	newCall.phone = req.body.phone;
	newCall.time = req.body.time;
	console.log(newCall)
	client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], (err, reply)=>{
		if(err){
			console.log(err.message);
		}
		console.log('this is the reply ', reply)
		res.redirect('/')
	})

})

app.listen(3000);
console.log('Server Started On Port 3000...');

module.exports = app;