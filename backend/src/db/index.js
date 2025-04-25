import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOODB_URL}`);
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Error While connecting to the DataBase",error);
        process.exit(1);
    }
}