import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import mongoose from "mongoose"
//import dotenv from "dotenv"
import adminRoute from "./routes/adminRoute.js"
import publicRoute from "./routes/publicRoute.js"
import path from 'path'
import { fileURLToPath } from "url";

//For ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename); // Fixed: removed asterisks

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true 
}

app.get("/", (req,res)=>{
    res.send("API IS WORKING")
})
mongoose.set('strictQuery',false)
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('MongoDB database is connected')
    } catch (err) {
        console.log("MongoDB database is connection failed")
        
    }
}



// middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use('/api/v1/admin',adminRoute)
app.use('/api/v1/public',publicRoute)
//Production setup
if (process.env.NODE_ENV === 'production') {
    const parentDir = path.join(_dirname, '..'); // project root (../)
    const distPath = path.join(parentDir, 'frontend', 'dist');
    app.use(express.static(distPath));
    
    // Fixed: Use wildcard (*) instead of regex pattern for Express 5.x
    // app.get('*', (req, res) => {
    //     res.sendFile(path.join(distPath, 'index.html'));
    // });
} else {
    app.get('/', (req, res) => res.send('Server is Ready'));
}

app.listen(port, ()=>{
    connectDB();
    console.log("server is running on port" + port)
})
