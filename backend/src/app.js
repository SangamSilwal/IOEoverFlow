import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())


import userRoutes from "./routes/user.route.js"
import contentRoute from "./routes/content.route.js"
import displayUserRoute from "./routes/displayUser.route.js"

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/posts",contentRoute)
app.use("/",displayUserRoute)


export {app}