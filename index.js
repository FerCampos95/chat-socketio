// console.log("Servidor iniciado");
const path= require("path");
const express = require("express");
const app= express();

app.set("port", process.env.PORT || 3000);//si se ejecutra en la nube agarra un puerto de ahi, sino usa el puerto 3000
app.use(express.static(path.join(__dirname,"public")));

const server = app.listen(app.get("port"), ()=>{
    console.log("servidor en puerto", app.get("port"));
})



const SocketIO= require("socket.io");
const io= SocketIO(server);

//websockets
io.on("connection", (socket)=>{
    console.log("Se conecto alguien, socket: "+socket.id);

    socket.on("chat:mensaje",(info)=>{
        io.sockets.emit("chat:mensaje",info);
    });

    socket.on("chat:escribiendo",(user)=>{
        if(user==null){
            user="Nuevo usuario";
        }
        socket.broadcast.emit("chat:escribiendo",user);
        
    })

    socket.on("chat:noEscribe",(user)=>{
        if(user==undefined){
            user="Nuevo usuario";    
        }
        socket.broadcast.emit("chat:noEscribe",user);
        
    })
})
