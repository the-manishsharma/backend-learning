// require('dotenv').config({path : "./.env"})   //spoil consistency of code but still runnable code there is no issue in running 

// import syntax was resolved using experimental feature

import dotenv from 'dotenv'


import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({
  path : './.env'
})


connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running at port ${process.env.PORT}`);
    // now our application almost ready
  })
})
.catch((err) =>{
  console.log("MongoDB Connection error!!", err);
  
})























// First approach:
/*
import express from 'express'
const app = express()
// function mongoDB(){}

// mongoDB()                 // Not bad but these can be improved or can be written in more professinal approach


(async()=>{
  try {
    await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)          // for databse connection only url is not enough but we need to provide "/database_name"

    // error event listener
    app.on("error", (error)=>{
      console.log("ERROR:",error);
      throw error
    })
    
    app.listen(process.env.PORT, ()=>{
      console.log(`App is listening on port ${process.eventNames.PORT}`);
      
    })

  } catch (error) {
    console.error("ERROR :",error)
    throw err
  }
})()

*/