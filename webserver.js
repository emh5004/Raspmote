var app = require('express')();
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(bodyParser.json());
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require("fs");
var path = require("path");
var remoteValues;
var execute = require('child_process').exec;

server.listen(80);

	fs.readFile(path.join(__dirname,'remote.json'), function (err, data) {
	   if (err) {
		   return console.error(err);
	   }
	   remoteValues = JSON.parse(data)
	   console.log(remoteValues)
	});
var applications = [{name:"Remote Control",uri:"/remote",indexFile:path.join(__dirname,"remote.html")}]

app.get('/*', function(req, res) {
	console.log(req.path)
	switch(req.path){
		case "/manifest.json":
			res.sendFile(path.join(__dirname,'manifest.json'))
			break;
		case "/96.png":
			res.sendFile(path.join(__dirname,'96.png'))
			break;
		case "/144.png":
			res.sendFile(path.join(__dirname,'144.png'))
			break;
		case "/192.png":
			res.sendFile(path.join(__dirname,'192.png'))
			break;
		default:
			res.sendFile(path.join(__dirname,"remote.html"));
	}
});
app.options('/command', cors())
app.post('/command', cors(), function(req,res){
	console.log(req.body);
	for(var x = 0; x< req.body.length; x++)
	{
		lookupCommand(req.body[x], function(command){
			execute(command,function(error, stdout, stderr){
				console.log(error + " " + stdout + " " + stderr);
			});
		});
	}
	res.json(req.body)
})
//	app.get('/remote', function(req, res) {
	//	res.sendFile("remote.html");
		//});
//remote control stuffs

io.on('connection', function(socket){
	console.log("connection!")
	socket.on('remotePress', function(state){
		//console.log(state.key + " pressed.");
		lookupCommand(state, function(command){
			execute(command,function(error, stdout, stderr){
				//console.log(error + " " + stdout + " " + stderr);
				socket.emit('remoteReply',state.key)
			});
		});
	});
});

function lookupCommand(call, callback) {
   for (x in remoteValues)
   {
		if(remoteValues[x].key == call.key)
		{
			//console.log(remoteValues[x].cmd)
			callback(remoteValues[x].cmd);
		}
   }
}
