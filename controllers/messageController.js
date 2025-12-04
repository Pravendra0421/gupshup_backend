import mongoose from "mongoose";
import MessageModel from "../models/MessageModel.js";
export const addMessage =async (req,res)=>{
    try {
        const {from,to,message} = req.body;
        const data = await MessageModel.create({
            message:{text:message},
            Users:[from,to],
            sender:from,
        });
        if(data){
            return res.status(200).json({
                success:true,
                msg:"Message added successfully"
            })
        }else{
            return res.status(400).json({
                success:false,
                msg:"failed to add message to the database"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            msg:"internal server error"
        })
    }
}
export const getMessage = async(req,res)=>{
    try {
        const {from,to} = req.body;
        const message= await MessageModel.find({
            Users:{
                $all:[from,to]
            },
        }).sort({updatedAt:1});
        // Transform data for Frontend
        // We calculate 'fromSelf' right here to make frontend logic easier
        const projectedMessage = message.map((msg)=>{
            return{
                fromSelf:msg.sender.toString() === from,
                message:msg.message.text,
                read:msg.read
            };
        });
        return res.json(projectedMessage);
    } catch (error) {
        return res.status(500).json({
            success:false,
            msg:"internal server error"
        })
    }
}
export const getUnreadCounts = async (req,res)=>{
    try {
        const currentUserId = req.user._id;
        const unreadCounts = await MessageModel.aggregate([
            {
                $match:{
                    Users:{$in:[currentUserId]},
                    sender:{$ne:new mongoose.Types.ObjectId(currentUserId)},
                    read:false
                }
            },
            {
                $group:{
                    _id:"$sender",
                    count:{$sum:1}
                }
            }
        ]);
        const countMap ={};
        unreadCounts.forEach(item=>{
            countMap[item._id] =item.count;
        });
        res.json({
            success:true,
            counts:countMap
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            msg:"internal server error"
        })
    }
}
export const markMessageRead = async (req,res)=>{
    try {
        const {from} = req.body;
        const currentUserId = req.user._id;
        await MessageModel.updateMany({
            Users:{$all:[from,currentUserId]},
            sender:from,
            read:false
        },
        {
            $set:{read:true}
        }
    );
    res.json({
        success:true,
        msg:"Messages marked as read"
    });
    } catch (error) {
        return res.status(500).json({
            success:false,
            msg:"internal server error"
        })
    }
}