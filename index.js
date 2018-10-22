var express= require('express');
var app = express();
var server=require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public')); //sirviendo nuestros archivos estaticos css, js, images
var port=process.env.PORT || 3000; //Esto es por heroku

//********** Autor ***********
// José Luis Olivares, Octubre 2018.
//***************************

// Define/initialize our global vars
 var socketCount=0;
 var connectedUsers = []; //array to store usernames and socket.id
//-------------------------------


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
			socketCount+=1;// al conectarse un socket, incrementamos el contador	
			io.sockets.emit('users connected', socketCount);    // Notificamos a todos los sockets cuantos estan conectados		
//Aqui implementaremos nuestros eventos de socketIO




//---------------------------------------------

    socket.on('disconnect', function () {
        socketCount--; // Decrementamos el contador
        var userDisconnected="Nadie";
	    for(var i=0; i < connectedUsers.length; i++){  //borrando usuarios desconectados  
	        if(connectedUsers[i].id === socket.id){
	        	userDisconnected=connectedUsers[i].userName;
	          connectedUsers.splice(i,1); 
	        }
	    }

        io.sockets.emit('Users connected', socketCount);    // Notificamos a todos los sockets cuantos estan conectados	
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
