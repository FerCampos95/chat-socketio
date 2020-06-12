// console.log("Chateando");
const socket =io();

let mensaje= document.getElementById("mensaje");
let btnEnviar= document.getElementById("btn-enviar");
let ulMensajes= document.getElementById("ul-mensajes");
let divNotificaciones= document.getElementById("notificaciones");
let escribiendo= document.getElementById("escribiendo");

// let usuario= document.getElementById("nombre-usuario");
let usuario=undefined;
let hora;

btnEnviar.addEventListener("click",emitirMensaje);

function emitirMensaje(e){
    if(mensaje.value==null || mensaje.value.trim()==""){ //si no escribio nada o solo espacios no envia
        return;
    }
    
    let divPadreMensajes= document.getElementById("padre-mensajes");
    divPadreMensajes.scrollTop= divPadreMensajes.scrollHeight;

    hora= new Date();
    hora= hora.getHours()+":"+hora.getMinutes();
    if(usuario==undefined){
        do{
            usuario=window.prompt("Ingrese el nombre de usuario(15 caracteres max): ");
            if(usuario==null){
                return;
            }
        }while(usuario.length>15);
    }
    
    socket.emit("chat:mensaje",{ //envio los datos al index.js
        mensaje: mensaje.value,
        usuario: usuario,
        hora: hora
    })
    mensaje.value="";
    mensaje.select();
}

mensaje.addEventListener("keyup",(e)=>{
    let key= e.keyCode || e.charCode;
    //si presiono enter envia el mensaje
    if(key==13){//equivale a enter
        emitirMensaje(e);
    }else{//sino presiono enter emito escribiendo
        if(mensaje.value==""){ ///pero si se limpio la linea no lo emito
            socket.emit("chat:noEscribe",usuario);
        }else{
            socket.emit("chat:escribiendo",usuario);
        }
    }
})


socket.on("chat:mensaje", (info)=>{
    ///ACA LE LLEGA EL MENSAJE A TODOS
    let liMensaje= document.createElement("li");
    liMensaje.id="li-mensaje";
    if(info.usuario==usuario){
        liMensaje.className="mensaje-mio";
    }else{
        liMensaje.className="mensaje-otro";
    }

    let labelUsuario= document.createElement("label");
    labelUsuario.innerText=info.usuario;
    labelUsuario.id="nombre-usuario";
    
    let labelMensaje= document.createElement("label");
    labelMensaje.innerText=info.mensaje;
    labelMensaje.id="texto-mensaje";
        
    let labelHora= document.createElement("label");
    labelHora.innerText= info.hora;
    labelHora.id="hora-mensaje";

    liMensaje.appendChild(labelUsuario);
    liMensaje.appendChild(labelMensaje);
    liMensaje.appendChild(labelHora);

    ulMensajes.appendChild(liMensaje);
})

socket.on("chat:escribiendo",(user)=>{
    escribiendo.innerText=user+" esta escribiendo";
})

socket.on("chat:noEscribe",(user)=>{
    escribiendo.innerText=user+"ya no escribe";
})