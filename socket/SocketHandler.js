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
        
        // 3. CLEANUP ON DISCONNECT
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