import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
    message:{
        text:{
            type:String,
            required:true
        },
    },
    Users:Array,
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    read:{
        type:Boolean,
        default:false,
    }
},{
    timestamps:true
});
export default mongoose.model("Message",MessageSchema);