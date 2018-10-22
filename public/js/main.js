//Autor/Author: José Luis Olivares
//https://linkedin.com/in/jolivaress
var socket = io.connect('https://equisgame.herokuapp.com/'); //creating socket connection
var app = {
    myUserName:-1, //-1 es no definido
    players:-1, //inicializando -1 es nadie
    myMark:-1, //-1 es no definido
    myId:-1,
    player2Id:-1,
    wp0:-1,  //posiciones finales con las que ganó el juego
    wp1:-1,
    wp2:-1,
    // Application Constructor
    initialize: function() {
        app.listenSocket();
        app.prepareBoard(true, true); //prepareBoard(Does it put happy faces?, are the buttons disabled?)
    },
    listenSocket:function(){
        //var socket = io.connect(this.serverUrl); //creating socket connection
        socket.on('users connected', function(data){
            $('#usersConnected').html(data); //mostrando usuarios conectados
        }); 

        socket.on('users list',function(connectedUsers){
            //var valores=connectedUsers;
            //debugger;
            $('#selectVersus').children('option:not(:first)').remove(); //limpiando todos los valores, menos el primero

            for (var i = 0; i < connectedUsers.length; i++) {
                if(connectedUsers[i].userName!==app.myUserName){
                    $('#selectVersus').append($('<option>',{ value:connectedUsers[i].userName,text:connectedUsers[i].userName}));
                }
            }

        });

        socket.on('start game', function(data){ //data contiene los nombres de los jugadores (solo para Rival)
                var play=confirm(data.contender+' quiere jugar contigo...')||false;
                if(play==true){//si acepta jugar 
                    socket.emit('game started',data); //le indicamos al server que el juego inicio
                    $("#selectVersus").val(data.contender.toString()); //mostramos el nombre del contrincante
                    $("#selectVersus").prop('disabled',true);//desabilitamos el select
                    $('#btnFight').prop('disabled', true);  //desabilitamos boton
                    //app.myMark=data.rivalMark;
                    
                    //data.idRival
                } //si no acepta hacer, hacer algo     
        });

        socket.on('contender firstmove', function(data){ //data contiene los nombres y ids de los jugadores 
            //ocurre en lado del Contender
            alert(data.rivalName+' ha aceptado Jugar... ¡realiza el primer movimiento!');
            $("#selectVersus").val(data.rivalName.toString()); //mostramos el nombre del rival
            $("#selectVersus").prop('disabled',true);//desabilitamos el select
            app.players=data; //guardamos los datos de los jugadores en memoria local del contender, es un Json
            app.myMark=data.contenderMark; //guardamos marca del Contender 
            
            app.myId=data.idContender; //guardado id en memoria local
            app.player2Id=data.idRival;//guardadndo id del segudno jugador
            
            app.prepareBoard(false,false); //habilitamos el tablero para que Contender seleccione una posicion.
            socket.emit('config rival',data); //enviando datos de los usuarios para que los almacene el rival

            //**************************
            //aqui esperamos hasta que el contender de clic en algun botón indicando su posición a elegir
            //se debe disparar app.setPosition();
            //*****************
        });

        socket.on('rival setplayers', function(data){ //data contiene los nombres y ids de los jugadores
            //Ocurre solo en el lado del Rival
            app.players=data; //guardamos los datos de los jugadores en memoria local del Rival 
            app.myMark=data.rivalMark;//guardamos marca del Rival 
            
            //guardando ids de jugadores en memoria local
            app.myId=data.idRival;
            app.player2Id=data.idContender;
            //debugger;    
        });   

        socket.on('playing', function(data){ //data
             //marcado el movimiento del jugador anterior en nuestro tablero
            $('#'+data.markedPosition.toString()).html('<span class="uk-text-large uk-text-bold">'+data.mark+'</span>');           
            app.prepareBoard(false,false); //deshabilitamos botones
            alert("¡Es tu turno!");
        });

        socket.on('you lose',function(data){
            changeColor(data.p0,data.p1,data.p2); //marcando tambien las posiciones del ganador
            $(data.p2.toString()).html('<span class="uk-text-large uk-text-bold">'+data.winMk+'</span>');//ponemos la ultima marca
            $(data.p1.toString()).html('<span class="uk-text-large uk-text-bold">'+data.winMk+'</span>');//ponemos la ultima marca 
            $(data.p0.toString()).html('<span class="uk-text-large uk-text-bold">'+data.winMk+'</span>');//ponemos la ultima marca
            navigator.vibrate(1000); //usando el vibrador del cel
            alert("¡Perdiste!");
            //app.prepareBoard(true,true);
        });                      

        $('#btnLogin').on('click',function(){
                var userName=$('#txtUserName').val()||-1;//Guardadndo Nombre de usuario
                app.myUserName=userName.trim();
                if(app.myUserName==="" || app.myUserName.length <3){
                    UIkit.notification("<span class='uk-text-capitalize'>Escriba nombre de usuario</span>", {status: 'danger'});
                    app.myUserName=-1;
                }else{
                    socket.emit('user loging',app.myUserName);
                    $('#txtUserName').prop('disabled', true); //Desabilitando el input
                    $('#btnLogin').prop('disabled',true);//disabling btnLogin
                    $('#btnLogout').prop('disabled',false); 
                    $('#selectVersus').prop('disabled',false);
                    $('#divVersus').prop('hidden',false);   //haciendo visible
                    $('#divLogin').addClass('uk-invisible');//ocultando login
                    $('#divMyUser').html(app.myUserName);                        
                }
        }); 

        $('#btnLogout').on('click',function(){      
                $('#txtUserName').prop('disabled', false); 
                $('#btnLogin').prop('disabled',false);
                $('#btnLogout').prop('disabled',true);
                $('#divVersus').prop('hidden',true);
                $('#divLogin').removeClass('uk-invisible');//mostrando login
                location.reload();
        });

        $("#selectVersus").change(function() {
            if($('#selectVersus').val()!=="0"){
                $('#btnFight').prop('disabled',false);                
            }
        }); 

        $('#btnFight').on('click',function(){  
            var rival=$('#selectVersus').val() || "0";  
            if (rival!=="0"){ //se intenta configurar la pelea
                $('#btnFight').prop('disabled', true); 
                socket.emit('play with',{rivalName:rival,contender:app.myUserName}); //enviando el nombre del rival a retar                    
            }  

        });

        $("#txtUserName").keyup(function(event) {
            if (event.keyCode === 13) {
            $("#btnLogin").click();
        }
});

    },

    prepareBoard: function(happyFaces,areBtnDisabled){
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if(happyFaces===true){
                    $('#p'+i+j).html('<span class="uk-icon" uk-icon="icon: happy"></span>'); 
                }

                $('#p'+i+j).prop('disabled',areBtnDisabled); //it can be true or false
            }       
        }
    },

    setPosition: function(pos){
        if(pos && !isDisabled(pos)){ //si la posicion existe y si el boton esta habilitado
            var btnPosText=$('#'+pos.toString()).text();

            if(app.players!==-1){ //si estan los datos de los jugadores en memoria
                var nextPlayer={idNextPlayer:-1,markedPosition:-1,mark:app.myMark};
                
                if (btnPosText!=="X" && btnPosText!=="O" ) { //si no ha sido marcada la posicion
                    $('#'+pos.toString()).html('<span class="uk-text-large uk-text-bold">'+app.myMark+'</span>');//ponemos su marca
                    app.prepareBoard(false,true);//deshabilitamos todos los botones, para que solo el otro jugador pueda seguir                   
                    
                    if(evaluateGame(app.myMark)){//Evaluando el estado del Juego!
                        changeColor(app.wp0,app.wp1,app.wp2); //marcando posicion ganadora 
                        socket.emit('game over',{idWinner:app.myId,idLoser:app.player2Id,winMk:app.myMark,p0:app.wp0,p1:app.wp1,p2:app.wp2});
                        navigator.vibrate(1000);//usando el vibrador del cel
                        alert("¡Felicidades ganaste!");
                        //setTimeout(app.prepareBoard(true,true), 3500);
                        
                        //definir que hace cuando usuario local gana el juego
                    }else{                      
                        nextPlayer.markedPosition=pos; //posicion a marcar en el tablero del segundo jugador
                        if (app.myUserName===app.players.rivalName) { //si quien movio es el rival
                            nextPlayer.idNextPlayer=app.players.idContender; //el proximo movimiento sera del contender
                        }else{
                            nextPlayer.idNextPlayer=app.players.idRival;//el proximo movimiento sera del rival
                        }
                        //enviamos posicion y id del siguiente jugador para que tambien se aplique la seleccion en su tablero
                        socket.emit('next player',nextPlayer); 
                    }

                }else{ //¿que pasa si intenta colocar en marca en espacio ocupado? 
                    alert("Esta posición ya fue seleccionada");
                } 

            }//si no, es que hay un error en el juego y no se tienen todos los datos de los jugadores
            //pendiente definir que hacer si hay un error
        }
    }

};

function evaluateGame(playerMark){
    var mk="";
    if(playerMark==='X'){
        mk='XXX';
    }else{
        mk='OOO';
    }

    var p00=$('#p00').text();
    var p01=$('#p01').text();
    var p02=$('#p02').text();

    var p10=$('#p10').text();
    var p11=$('#p11').text();
    var p12=$('#p12').text();

    var p20=$('#p20').text();
    var p21=$('#p21').text();
    var p22=$('#p22').text();

    var test1=p00+p01+p02, test2=p10+p11+p12, test3=p20+p21+p22;
    var test4=p00+p10+p20, test5=p01+p11+p21, test6=p02+p12+p22;
    var test7=p00+p11+p22, test8=p20+p11+p02;

    switch (mk) { //evaluando las combinaciones para ganar
        case test1.trim():
            //changeColor('#p00','#p01','#p02');
            app.wp0='#p00',app.wp1='#p01',app.wp2='#p02';
            return true
            break;
        case test2.trim():
            //changeColor('#p10','#p11','#p12'); 
            app.wp0='#p10',app.wp1='#p11',app.wp2='#p12';       
            return true            
            break;

        case test3.trim():
            //changeColor('#p20','#p21','#p22'); 
            app.wp0='#p20',app.wp1='#p21',app.wp2='#p22';       
            return true            
            break;

        case test4.trim() :
            //changeColor('#p00','#p10','#p20');
            app.wp0='#p00',app.wp1='#p10',app.wp2='#p20';        
            return true            
            break;  

        case test5.trim():
            //changeColor('#p01','#p11','#p21');
            app.wp0='#p01',app.wp1='#p11',app.wp2='#p21';         
            return true            
            break;

        case test6.trim():
            //changeColor('#p02','#p12','#p22');  
            app.wp0='#p02',app.wp1='#p12',app.wp2='#p22';       
            return true            
            break;

        case test7.trim():
            //changeColor('#p00','#p11','#p22');
            app.wp0='#p00',app.wp1='#p11',app.wp2='#p22';         
            return true            
            break;

        case test8.trim():
            //changeColor('#p20','#p11','#p02');
            app.wp0='#p20',app.wp1='#p11',app.wp2='#p02';         
            return true            
            break;
        default:  
               
        return false;          
    }

    return false;
}

function changeColor(btn1,btn2,btn3){
    $(btn1.toString()).prop('disabled',false);
    $(btn1.toString()).removeClass('uk-button-default');
    $(btn1.toString()).addClass('uk-button-danger');
    $(btn1.toString()).removeClass('uk-card-hover');

    $(btn2.toString()).prop('disabled',false);
    $(btn2.toString()).removeClass('uk-button-default');
    $(btn2.toString()).addClass('uk-button-danger');
    $(btn2.toString()).removeClass('uk-card-hover');    
    
    $(btn3.toString()).prop('disabled',false);
    $(btn3.toString()).removeClass('uk-button-default');
    $(btn3.toString()).addClass('uk-button-danger'); 
    $(btn3.toString()).removeClass('uk-card-hover');           
}

function isDisabled(btn){//valida si el boton está habilitado o no
  if(document.getElementById(btn.toString()).disabled){
    return true;
  }
  return false;  
}
