import mongoose,{ Schema} from "mongoose";

const contentSchema = new Schema({
    title:{
        type: String
    },
    description:{
        type:String
    },
    fileAttach:[
        {
            type: String
        }
    ],
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
        {
            user:{type:Schema.Types.ObjectId,ref:"User"},
            createdAt:{type:Date,default:Date.now}
        }
    ],
    comments:[
        {
            _id: {type: Schema.Types.ObjectId,default:() => new mongoose.Types.ObjectId()},
            user:{type:Schema.Types.ObjectId,ref:"User"},
            text:String,
            replies:[
                {
                    _id: {type: Schema.Types.ObjectId,default:() => new mongoose.Types.ObjectId()},
                    user:{type:Schema.Types.ObjectId,ref:"User"},
                    text:String,
                    createdAt:{type:Date,default:Date.now} 
                }
            ],
            createdAt:{type:Date,default:Date.now},
        }
    ]
})

export const Content = mongoose.model("Content",contentSchema)