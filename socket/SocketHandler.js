import { Server } from "socket.io";
export const initializeSocketIo =(httpServer)=>{
    const io = new Server(httpServer,{
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST","PUT","DELETE"],
            credentials:true
        }
    });
    io.on("connection",(socket)=>{
        console.log(`Socket Connected Successfully. ID:${socket.id}`);
        socket.on("send message",(data)=>{
            console.log(`message recieved from ${socket.id}:${data.text}`);
            socket.broadcast.emit("recieve message",data)
        });
        
        socket.on("disconnect",()=>{
            console.log(`user Disconnected Id :${socket.id}`);
        });
    });
    return io;
}