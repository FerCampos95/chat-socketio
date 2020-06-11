// console.log("Chateando");
const socket =io();

let mensaje= document.getElementById("mensaje");
let btnEnviar= document.getElementById("btn-enviar");
let divMensajes= document.getElementById("mensajes");
let divNotificaciones= document.getElementById("notificaciones");
let escribiendo= document.getElementById("escribiendo");
// let usuario= document.getElementById("nombre-usuario");
let usuario= "HARDCOEADO";

btnEnviar.addEventListener("click",()=>{
    socket.emit("chat:mensaje",{ //envio los datos al index.js
        mensaje: mensaje.value,
        usuario: usuario
    })
});

mensaje.addEventListener("keypress",()=>{
    socket.emit("chat:escribiendo",usuario);
})


socket.on("chat:mensaje", (info)=>{
    let p= document.createElement("p");
    p.innerText="Usuario: "+info.usuario+": "+info.mensaje;
    divMensajes.appendChild(p);
})

socket.on("chat:escribiendo",(user)=>{
    escribiendo.innerText=user+" esta escribiendo";
})
