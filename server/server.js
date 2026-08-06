
// configurations
import "dotenv/config";
import dns from "dns";
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

// config functions 
import connectDB from "./src/config/db.js";

// middlewares and rate limit functions 
import { auth_api_limit } from './src/middlewares/rate.limit.js';
import globalHandler from "./src/middlewares/golbalErrorHandler.js";

import userRoutes from "./src/modules/auth/auth.routes.js"
import gitAuthRoutes from './src/modules/gitAuth/git.auth.route.js';
import googleAuth from './src/modules/googleAuth/googleAuth.route.js';
// instances 
const app = express();

// route to test or ensure server connections
app.get('/', (req, res)=>{
    res.send("Task Manager Server is Working");
})

// API payload validations 
app.use(cookieParser())
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({extended: true, limit: '100kb'}));

// Domain name service configurations
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

// cors - only this origin can request to the server
// app.use(cors({
//     origin: ["http://localhost:5173/"],
//     credentials: true,    
// }));

app.use(cors());

// database connetions 
connectDB();

// middlewares (rate limit)
app.use('/', auth_api_limit);

// routes 
app.use('/accounts', userRoutes);
app.use('/gitAuth', gitAuthRoutes);
app.use('/googleAuth', googleAuth)
// global error catching middleware 
app.use(globalHandler);

// open server to listen requests
app.listen(process.env.PORT,() =>{
    console.log(`Server is running on PORT : ${process.env.PORT}`);
})

// now all api and middleware will defined here 