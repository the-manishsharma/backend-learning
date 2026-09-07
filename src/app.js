import cors from 'cors'
import cookieParser from 'cookie-parser'


import express from 'express'
const app = express()
// configuration to accept data or making accessible for machine

// configuration for 
app.use(cors({
  origin : process.env.CORS_ORIGIN,
  credentials : true
}))
//  configuration 
app.use(express.json({limit : "16kb"}))
// configuration when data comes from url
// configuration for url encoding ( it converts special character )
app.use(express.urlencoded({extended : true, limit:"16kb"}))

// configuration to store assets like images , favicon in public foder on our own server
app.use(express.static('public'))

// configuration of cookie-parser
app.use(cookieParser())


// all the above configuration/middleware is kept as it is first 

// routes import 
import userRouter from './routes/user.routes.js'


// routes declaration
// due to segregation we need middleware to import routers
app.use( "/api/v1/users",userRouter)           // all the control will be paassed to user.routes.js file by userRuter


//http://localhost:8000/user/register       // all the method after user will be written in user.routes.js  


export { app }