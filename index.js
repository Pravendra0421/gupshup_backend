import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/databse.js";
import {createServer} from "http";
import UserRoute from "./routes/UserRoute.js";
import MessageRoute from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { initializeSocketIo } from "./socket/SocketHandler.js";
const app = express();
dotenv.config();
connectDb();
const PORT =process.env.PORT;
const httpServer=createServer(app);
const io = initializeSocketIo(httpServer);
app.use(cors({
    origin:process.env.Frontend_URL,
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}
));
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1',UserRoute);
app.use('/api/v1',MessageRoute);
app.get('/ping', (req, res) => {
    res.send('Pong');
});
httpServer.listen(PORT,()=>{
    console.log(`server is running ${PORT}`)
});