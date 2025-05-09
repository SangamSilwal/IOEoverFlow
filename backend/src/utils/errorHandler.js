import { ApiError } from "./ApiError.js";
const errorHandler = (err,req,res,next) => {
    console.log(err);
    if(err instanceof ApiError)
    {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
        });

    }
    else{
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    }
} 

export default errorHandler;