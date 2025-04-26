import mongoose,{Schema,model} from "mongoose";
import { ioeCollegeValues,ioeBachelorProgramsValues} from "../constants.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim:true,
        maxlength: 40
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength:20,
        index:true,
        lowercase:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    password: {
        type: String,
        required: [true,"Password is required"]

    },
    biostatus: {
        type: String,
    },
    collegeName: {
        type: String,
        required: true,
        enum : {
            values: ioeCollegeValues,
            message: `{value} is not a valid IOE-affiliated college name. Supported colleges are ${ioeCollegeValues.join(', ')}`,
        }
    },
    departMent: {
        type: String,
        required: true,
        enum: {
            values: ioeBachelorProgramsValues,
            message: `{value} is not a valid program in IOE`
        },

    },
    refreshToken:{
        type:String
    },
    profilePicUrl: {
        type: String,
        default:"https://res.cloudinary.com/dc7xpzhax/image/upload/v1745648506/default_qsjqzc.png"
    },
    content: [{
        type: Schema.Types.ObjectId,
        ref:'Content'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref:'User'
    }],
    friendRequest: [{
        type: Schema.Types.ObjectId,
        ref:'User'
    }],
    sentRequest: [{
        type: Schema.Types.ObjectId,
        ref:'User'
    }]

},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password)
{
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.genrateAccessToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateRefreshToken = async function()
{
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User",userSchema)