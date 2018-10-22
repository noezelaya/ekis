//Autor/Author: José Luis Olivares
//https://linkedin.com/in/jolivaress
var socket = io.connect(''); //creamos la conexion con socketio
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

    },
    listenSocket:function(){
 

        $('#btnLogin').on('click',function(){//agregar codigo


        }); 

        $('#btnLogout').on('click',function(){  //agregar codigo    

        });

        $("#selectVersus").change(function() {//agregar codigo

        }); 

        $('#btnFight').on('click',function(){  //agregar codigo


        });

        $("#txtUserName").keyup(function(event) { //agregar codigo

        }


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

    }

};

function evaluateGame(playerMark){
    var mk="";
    if(playerMark==='X'){
        mk='XXX';
    }else{
        mk='OOO';
    }

    var p00=$('#p00').text(), p01=$('#p01').text();
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
            app.wp0='#p00',app.wp1='#p01',app.wp2='#p02';
            return true
            break;
        case test2.trim():
            app.wp0='#p10',app.wp1='#p11',app.wp2='#p12';       
            return true            
            break;

        case test3.trim():
            app.wp0='#p20',app.wp1='#p21',app.wp2='#p22';       
            return true            
            break;

        case test4.trim() :
            app.wp0='#p00',app.wp1='#p10',app.wp2='#p20';        
            return true            
            break;  

        case test5.trim():
            app.wp0='#p01',app.wp1='#p11',app.wp2='#p21';         
            return true            
            break;

        case test6.trim(): 
            app.wp0='#p02',app.wp1='#p12',app.wp2='#p22';       
            return true            
            break;

        case test7.trim():
            app.wp0='#p00',app.wp1='#p11',app.wp2='#p22';         
            return true            
            break;

        case test8.trim():
            app.wp0='#p20',app.wp1='#p11',app.wp2='#p02';         
            return true            
            break;
        default:  
               
        return false;          
    }

    return false;
}


function isDisabled(btn){//valida si el boton está habilitado o no
  if(document.getElementById(btn.toString()).disabled){
    return true;
  }
  return false;  
}
