import mongoose from "mongoose";
const connectDb = async()=>{
    try {
    const connect = mongoose.connect(process.env.MONGOURI);
    if(connect){
        console.log("database is connected successfully");
    }
        
    } catch (error) {
       console.error("database connection error",error); 
    }
}
export default connectDb;