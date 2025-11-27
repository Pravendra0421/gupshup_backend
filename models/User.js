import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength: 3,
        maxlength: 20
    },
    userName:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        index:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    isAvatarImageSet:{
        type:Boolean,
        default:false
    },
    about:{
        type:String,
        default:"Hey there! I am using Ghupshup"
    }
},{
    timestamps:true
});
const User = mongoose.model('User',UserSchema);
export default User;