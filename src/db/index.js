import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)

    // MONGOOSE PROVIDE US A returned OBJECT IN RETURN SO AWAIT CAN BE HOLD IN A VARIABLE
    // connectionInstance holding all response after connection made with database

    console.log(`\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);
    
  } catch (error) {
    console.log("DATABASE Connection error", error);
    process.exit(1)
    
  }
}

export default connectDB