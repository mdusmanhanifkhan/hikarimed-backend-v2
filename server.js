import 'dotenv/config'

import express from "express"
import path from 'path';
import routes from "./routes/index.js"
import cors from "cors"
const app = express()

const port = process.env.PORT || 3003;
const FRONTEND_SERVICE_ORIGIN = process.env.CORE_ORIGIN_FRONTEND; 
const APP_BASE_URL = process.env.APP_BASE_URL;
const APP_BASE_URL_WWW = process.env.APP_BASE_URL_WWW;

const allowedOrigins = [
  "https://hikarimed.online",
  "https://www.hikarimed.online",
  "https://hikarimed.vercel.app",
  "http://localhost:5173",
  "https://md2vt317-5173.inc1.devtunnels.ms",
  "https://hikarimed-v2.vercel.app"
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
}))

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(routes)
app.use('/generated/uploads', express.static(path.join(process.cwd(), 'generated/uploads')));

app.get("/",(req,res)=>{
    return res.send("Welcome to Hikari Med Online")
})

app.listen(port, ()=>(
    console.log(`server is running on this port ${port} `)
))
