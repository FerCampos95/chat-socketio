// const io = require("express");

const socket =io();

let contenedorChat=document.getElementById("contenedor-chat");
let mensaje= document.getElementById("mensaje");
let btnEnviar= document.getElementById("btn-enviar");
let btnIniciar=document.getElementById("btn-iniciar");
let ulMensajes= document.getElementById("ul-mensajes");
let divNotificaciones= document.getElementById("notificaciones");
let escribiendo= document.getElementById("escribiendo");
let usuarios=new Array();
let listaUsuarios=new Array();
let inputUsuario =document.getElementById("ingreso-usuario");

let usuario=undefined;
let hora;

contenedorChat.style.display='none';
socket.emit("pedirConectados");



btnIniciar.addEventListener("click", ingresarUsuario);
inputUsuario.addEventListener("keyup", (event)=>{
    let contadorCaracteres= document.getElementById("caracteres");
    contadorCaracteres.innerText= inputUsuario.value.length;
    if(contadorCaracteres.innerText > 15){
        contadorCaracteres.style.color="red";
    }else{
        contadorCaracteres.style.color="green";
    }

    //FINALMENTE SI PRESIONO ENTER PRESIONO INICIAR y puedo escribir mensaje
    if(event.keyCode == 13){
        ingresarUsuario();
        mensaje.focus();
    }
})

function ingresarUsuario(){
    usuario= document.getElementById("ingreso-usuario").value;
    let etiquetaRequisitos= document.getElementById("requisitos");

    if(usuario=="" || usuario==null || usuario=="undefined" || usuario.trim()=="" || usuario ==undefined || usuario.length>15){
        etiquetaRequisitos.innerText="Error, el usuario debe tener entre 1-15 Caracteres";
        inputUsuario.focus();
        return;
    }

    let tengoQueSalir=false;//variable para guardar la respuesta del foreach
    listaUsuarios.forEach( (user) =>{
        if(user.nombreUsuario == usuario){
            console.log("Comparando: "+user.nombreUsuario +" - " +usuario);
            etiquetaRequisitos.innerText="Lo siento, El nombre de usuario ya está en uso";
            tengoQueSalir= true;
        }
    })
    if(tengoQueSalir)
        return;

    document.getElementById("ingresar-usuario").style.display="none";
    contenedorChat.style.display='inline-block';

    socket.emit("nuevoConectado",{ ///para q todos sepan usuario y id
        usuario: usuario
    })
    socket.emit("pedirConectados");
}

btnEnviar.addEventListener("click",emitirMensaje);

function emitirMensaje(e){
    if(mensaje.value==null || mensaje.value.trim()==""){ //si no escribio nada o solo espacios no envia
        return;
    }

    hora= new Date();
    hora= hora.getHours()+":"+hora.getMinutes();
    // if(usuario==undefined){
    //     do{
    //         usuario=window.prompt("Ingrese el nombre de usuario(15 caracteres max): ");
    //         if(usuario==null){
    //             return;
    //         }
    //     }while(usuario.length>15);
    // }
    
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
        escribiendo.innerText="";
    }else{
        escribiendo.innerText=lineaUsuarios+" esta escribiendo";
    }
})

// socket.on("conectados", (data)=>{
//     console.log(listaUsuarios);
//     console.log(data);

//     // listaUsuarios.push(data);
//     listaUsuarios=data;

//     let ulConectados=document.getElementById("ul-conectados");
//     // console.log(ulConectados);
//     while(ulConectados.firstChild){///mientras haya un primer li
//         ulConectados.removeChild(ulConectados.firstChild);//lo remueve;
//     }

//     listaUsuarios.forEach( (user)=>{
//         let liConectado= document.createElement("li");
//         liConectado.id="li-conectado";
//         liConectado.innerText= data.nombreUsuario + "id: "+data.id; 

//         ulConectados.appendChild(liConectado);
//     })

//     console.log(listaUsuarios);
// })

socket.on("pedirConectados", (data)=>{ //data es un array con los conectados y su ID
    // console.log(data);

    listaUsuarios=data;
    console.log(listaUsuarios);

    let ulConectados=document.getElementById("ul-conectados");

    while(ulConectados.firstChild){///mientras haya un primer li
        ulConectados.removeChild(ulConectados.firstChild);//lo remueve;
    }

    listaUsuarios.forEach( (user)=>{
        let liConectado= document.createElement("li");
        liConectado.className="li-conectado";
        liConectado.innerText= user.nombreUsuario/* + " y su id: "+ user.idUsuario*/; 

        ulConectados.appendChild(liConectado);
    })
})