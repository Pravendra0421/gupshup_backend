import { Server } from "socket.io";
import Redis from "ioredis";

export const initializeSocketIo = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.Frontend_URL,
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        username: "default"
    });

    redis.on("connect", () => console.log("✅ Connected to Redis Phonebook"));
    redis.on("error", (error) => console.log("❌ Redis Error", error));
    const onlineUsers = new Map();
    io.on("connection", (socket) => {
        
        // 1. ADD USER TO REDIS
        socket.on("add-user", async (userId) => {
            if(userId){
                await redis.set(`user:${userId}`, socket.id);
                socket.userId = userId; // Save to socket object for disconnect
                // console.log(`User ${userId} mapped to ${socket.id}`);
                console.log("📢 Current Online Users Map:", Array.from(onlineUsers.keys()));
                onlineUsers.set(userId,socket.id);
                const onlineIds = Array.from(onlineUsers.keys());
                io.emit("online-users",onlineIds);
            }
        });

        // 2. SEND MESSAGE
        socket.on("send-msg", async (data) => {
            // data = { to, from, msg }
            const sendUserSocket = await redis.get(`user:${data.to}`);

            if (sendUserSocket) {
                socket.to(sendUserSocket).emit("msg-recieve",{
                    from:data.from,
                    message:data.msg
                });
            }
        });
        socket.on("mark-read",async (data)=>{
            const senderSocket = await redis.get(`user:${data.senderId}`);
            if(senderSocket){
                socket.to(senderSocket).emit("message-read",data.readerId);
            }
        })
        socket.on("typing",async(data)=>{
            const receiverSocket = await redis.get(`user:${data.to}`);
            if(receiverSocket){
                socket.to(receiverSocket).emit("typing",data.from);
            }
        });
        socket.on("stop-typing", async(data)=>{
            const receiverSocket = await redis.get(`user:${data.to}`);
            if(receiverSocket){
                socket.to(receiverSocket).emit("stop-typing",data.from);
            }
        })
        socket.on("notify-watch-party",async(data)=>{
            const receiverSocket = await redis.get(`user:${data.to}`);
            if(receiverSocket){
                io.to(receiverSocket).emit("incoming-watch-party",{
                    from:data.from,
                    userName:data.userName
                })
            }
        })
        socket.on("call-user",async(data)=>{
            const receiverSocket = await redis.get(`user:${data.userToCall}`);
            if(receiverSocket){
                io.to(receiverSocket).emit("call-user",{
                    signal:data.signalData,
                    from:data.from
                })
            }
        });
        socket.on("answer-call",async(data)=>{
            const senderSocket = await redis.get(`user:${data.to}`);
            if(senderSocket){
                io.to(senderSocket).emit("call-accepted",data.signal);
            }
        })
        socket.on("logout",async (userId)=>{
            if(userId){
                await redis.del(`user:${userId}`);
                console.log(`user ${userId} logged out manually`);
                onlineUsers.delete(userId);
                const onlineIds = Array.from(onlineUsers.keys());
                io.emit("online-users",onlineIds);
                socket.userId == null;
            }
        });
        socket.on("disconnect", async () => {
            if(socket.userId){
                await redis.del(`user:${socket.userId}`);
                console.log(`User ${socket.userId} disconnected`);

                onlineUsers.delete(socket.userId);
                const onlineIds = Array.from(onlineUsers.keys());
                io.emit("online-users",onlineIds);
            }
        });
        
    });
    return io;
}