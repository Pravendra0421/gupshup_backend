import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
export const SignUpController =async(req,res)=>{
    try {
        const {name,userName,password} = req.body;
        if(!name || !userName || !password){
            return res.status(404).json({
                success:"false",
                message:"please fill all the detail"
            });
        }
        if(password.length<6){
            return res.status(404).json({
                success:"false",
                message:"length of the password must we greater then 6 digit"
            })
        }
        const existingUser = await User.findOne({userName});
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already taken"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser =await User.create({
            name,
            userName,
            password:hashedPassword
        });
        return res.status(201).json({
            success:"true",
            message:"user sigup successfully",
            user:{
                _id:newUser._id,
                name:newUser.name,
                userName:newUser.userName
            }
        });
    } catch (error) {
        return res.status(500).json({
            success:"false",
            message:"error during signup"
        })
    }
}
export const LoginController = async (req,res)=>{
    try {
        const {userName,password} = req.body;
        if(!userName || !password){
            return res.status(404).json({
                success:"false",
                message:"please enter the correct detail"
            })
        }
        const user = await User.findOne({userName});
        if(!user){
            return res.status(400).json({
                success:"false",
                message:"user does not exist please login"
            })
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success:"false",
                message:"password doesnot matched"
            });
        }
        const token = jwt.sign(
            {_id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        );
        const isProduction = process.env.NODE_ENV === "production";
        return res.status(200).cookie("token",token,{
            httpOnly:true,
            // secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge:1*24*60*60*1000
        }).json({
            success:true,
            message:"user loggedIn Successfully",
            user:{
                _id:user._id,
                userName:user.userName,
                token:token
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:"false",
            message:"Internal server error"
        })
    }
}
export const GetAllUser = async (req,res)=>{
    try {
        const currentUserId = req.user.id;
        const user = await User.find({
            _id:{$ne:currentUserId}
        }).select([
            "userName",
            "avatarImage",
            "_id",
        ]);
        return res.status(201).json({
            success:true,user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"error during getAll the user"
        })
    }
}