import { dirname } from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import mongoose, { mongo } from "mongoose";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({path:join(__dirname,'../../.env')})

mongoose.Promise = global.Promise

mongoose.connection.on('error',(err)=>{
    console.log('Error on mongo connection :',err)
})

mongoose.connection.on('connected',()=>{
    console.log('Connected to DB')
})

const uri = process.env.MONGO_URI


export default  Connect = ()=>{
    mongoose.connect(uri,options)
    return mongoose.connection
}