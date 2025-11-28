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
                fromself:msg.sender.toString() === from,
                message:msg.message.text
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