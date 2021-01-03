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

let conectados= new Array();
//websockets
io.on("connection", (socket)=>{
    console.log("Se conecto alguien, socket: "+socket.id);

    
    socket.on("nuevoConectado",(nuevo)=>{
        let data={
            nombreUsuario: nuevo.usuario,
            idUsuario: socket.id
        }
        conectados.push(data);
    })
    socket.on("pedirConectados",()=>{
        io.sockets.emit("pedirConectados",conectados);
    })
    // socket.on("conectados",(info)=>{
    //     data={
    //         nombreUsuario: info.usuario,
    //         id: socket.id
    //     }
    //     socket.broadcast.emit("conectados",data);
    //     // socket.broadcast.emit("informacion",socket);
    //     console.log("Info enviada:"+socket);
    // })

    socket.on("chat:mensaje",(info)=>{
        io.sockets.emit("chat:mensaje",info);
    });

    socket.on("chat:escribiendo",(users)=>{
        socket.broadcast.emit("chat:escribiendo",users);
    })

    socket.on("disconnect", ()=>{
        // console.log("usuario desconectado"+ socket.id);
        conectados.forEach( (user, index)=>{
            if(user.idUsuario == socket.id){
                console.log(user.nombreUsuario + " se desconecto");
                conectados.splice(index,1); //elimino el usuario de la lista de conectados
            }
        })
        io.sockets.emit("pedirConectados",conectados);//emito los conectados para que se le actualice a todos
    })
})


