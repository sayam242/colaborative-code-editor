import express from "express"
import{createServer} from "http"
import{Server} from "socket.io"
import{YSocketIO} from "y-Socket.io/dist/server" 

const app=express()
const httpServer=createServer(app)

const io=new Server(httpServer,{
    cors:{
        origin:"*",
        method:["GET","POST"]
    }
})

const ySocletIO=new YSocketIO(io)
ySocletIO.initialize()



app.get("/",(req,res)=>{
    res.status(200).json({
        message:"hellp world",
        success:true
    })
})


app.get("/health",(req,res)=>{
    res.status(200).json({
        message:"ok",
        success:true
    })
})

httpServer.listen(3000,()=>{
    console.log("Server is running on port 3000")
})