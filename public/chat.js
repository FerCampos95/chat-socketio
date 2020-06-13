// console.log("Chateando");
const socket =io();

let mensaje= document.getElementById("mensaje");
let btnEnviar= document.getElementById("btn-enviar");
let ulMensajes= document.getElementById("ul-mensajes");
let divNotificaciones= document.getElementById("notificaciones");
let escribiendo= document.getElementById("escribiendo");
let usuarios=new Array();
let listaUsuarios=new Array();

// let usuario= document.getElementById("nombre-usuario");
let usuario=undefined;
let hora;

btnEnviar.addEventListener("click",emitirMensaje);

function emitirMensaje(e){
    if(mensaje.value==null || mensaje.value.trim()==""){ //si no escribio nada o solo espacios no envia
        return;
    }

    hora= new Date();
    hora= hora.getHours()+":"+hora.getMinutes();
    if(usuario==undefined){
        do{
            usuario=window.prompt("Ingrese el nombre de usuario(15 caracteres max): ");
            if(usuario==null){
                return;
            }
        }while(usuario.length>15);
    
        socket.emit("conectados",{ ///para q todos sepan usuario y id
            usuario: usuario
        })
    }
    
    socket.emit("chat:mensaje",{ //envio los datos al index.js
        mensaje: mensaje.value,
        usuario: usuario,
        hora: hora
    })
    mensaje.value="";
    mensaje.select();
    
    usuarios.forEach( (u,index)=>{
        if(u==usuario)//para quitarlo de la lista de escribiendo
            usuarios.splice(index,1);
    })
    socket.emit("chat:escribiendo",usuarios);//emito el escribiendo sin este usuario

    
}

mensaje.addEventListener("keyup",(e)=>{
    let key= e.keyCode || e.charCode;
    //si presiono enter envia el mensaje
    if(key==13){//equivale a enter
        emitirMensaje(e);
    }else{//sino presionó enter emito escribiendo
        usuarios.forEach((u,index)=>{ //limpio la lista de usuarios que tengan mi nombre
            
            if(usuario===u){
                usuarios.splice(index,1);
            }
        })
        if(mensaje.value==""){ ///pero si se limpio la linea no agrego el usuario a la lista de escribiendo
            // socket.emit("chat:noEscribe",usuario);  
        }else{
            usuarios.push(usuario); //si escribio lo agrego a la lista
        }
        // console.log("Emitiendo :"+usuarios);
        socket.emit("chat:escribiendo",usuarios);
    }
})


socket.on("chat:mensaje", (info)=>{
    ///ACA LE LLEGA EL MENSAJE A TODOS

    //bajo la barra del div
    let divPadreMensajes= document.getElementById("padre-mensajes");
    divPadreMensajes.scrollTop= divPadreMensajes.scrollHeight;

    let liMensaje= document.createElement("li");
    liMensaje.id="li-mensaje";
    if(info.usuario==usuario){
        liMensaje.className="mensaje-mio";
    }else{
        liMensaje.className="mensaje-otro";
    }

    let labelUsuario= document.createElement("label");
    labelUsuario.innerText=info.usuario+":";
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

socket.on("chat:escribiendo",(users)=>{
    let lineaUsuarios="";
    usuarios=new Array();
    users.forEach( (u,index)=>{    
        usuarios.push(u);

        if(u==null){
            // lineaUsuarios+="Nuevo Usuario, "
        }else{
            lineaUsuarios+= u + ", "
        }
    })
    
    if(lineaUsuarios===""){
        escribiendo.innerText="Nadie esta escribiendo";
    }else{
        escribiendo.innerText=lineaUsuarios+" esta escribiendo";
    }
})

socket.on("conectados", (data)=>{
    listaUsuarios.push(data);

    console.log(listaUsuarios);
})

// socket.on("chat:noEscribe",(user)=>{
//     escribiendo.innerText=user+"ya no escribe";
// })