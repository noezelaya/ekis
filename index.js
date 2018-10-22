var express= require('express');
var app = express();
var server=require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public')); //serving statics files like css, js, images
var port=process.env.PORT || 3000; //this is for heroku


// Define/initialize our global vars
 var socketCount=0;
 var connectedUsers = []; //array to store usernames and socket.id
//-------------------------------


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//io.set('origins','*:*');

io.on('connection', function(socket){
			socketCount+=1;// Socket has connected, increase socket count	
			io.sockets.emit('users connected', socketCount);    // Let all sockets know how many are connected		

	socket.on('user loging',function(userName){

		if(searchUser(userName)===-1){ //si nombre de usuario no existe en la lista
			connectedUsers.push({
				id : socket.id,
				userName : userName
			});

			console.log('An user connected... '+userName.toString());
			io.sockets.emit('users list', connectedUsers); // enviando listado de todos los usuarios conectados
		} 
		// falta emitir mensaje cuando nombre de usuario ya existe y solucionar problema

	});


	socket.on('play with', function(data){ //enviando invitacion a jugar
		var idRival=searchUser(data.rivalName);//buscando id
		data.idRival=idRival; //adicionando el idRival a data para no tener que buscarlo nuevamente
		data.rivalMark="O"; //el rival usará O (equivalente al cero)
		socket.broadcast.to(idRival).emit('start game',data);//invitando al rival
		console.log("===========Entro en play with");
	});
 

	socket.on('game started', function(data){ //recibiendo datos de los jugadores para comenzar a jugar
		var idContender=searchUser(data.contender);
		data.idContender=idContender;//adicionando el idContender a data para no tener que buscarlo nuevamente
		data.contenderMark="X"; 
		//invitando al contender a hacer el primer movimiento, setando jugadores en ambiente del contender	
		socket.broadcast.to(idContender).emit('contender firstmove',data);
		console.log("===========Entro en game started");
		console.log("idContender="+data.idContender+" ContenderMark="+data.contenderMark);
		console.log("idRival="+data.idRival+" rivalMark="+data.rivalMark);
	});

	socket.on('config rival',function(data){
		socket.broadcast.to(data.idRival).emit('rival setplayers',data); //seteando datos de jugadores en memoria del Rival 
	});
 
 	socket.on('next player', function(data){ //enviando invitacion a jugar
		socket.broadcast.to(data.idNextPlayer).emit('playing',data);//invitando al rival
		console.log("===========Entro en next player");
	});

 	socket.on('game over', function(data){ //enviando invitacion a jugar
		socket.broadcast.to(data.idLoser).emit('you lose',data);//invitando al rival
		console.log("===========Entro en game over");
		console.log("p0="+data.p0);
		console.log("p1="+data.p1);
		console.log("p2="+data.p2);
	});

    socket.on('disconnect', function () {
        socketCount--; // Decrease the socket count on a disconnect
        var userDisconnected="Nothing";
	    for(var i=0; i < connectedUsers.length; i++){  //deletng users desconnected   
	        if(connectedUsers[i].id === socket.id){
	        	userDisconnected=connectedUsers[i].userName;
	          connectedUsers.splice(i,1); 
	        }
	    }

        io.sockets.emit('Users connected', socketCount);    // Let all sockets know how many are connected
        console.log('User disconnected... '+userDisconnected);
    });

}); //close socket.on("connection")

function searchUser(userName){
	for(var i=0; i < connectedUsers.length; i++){  //deletng users desconnected   
	    if(connectedUsers[i].userName === userName){
	        return connectedUsers[i].id; //devolviendo el socket id
	    }
	}

	return -1; //not found
}

server.listen(port, function(){
  console.log('Server listening on *:'+port);
});
