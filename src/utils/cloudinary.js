import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET ,
        // CONFIGURATION gives us permission to upload file on cloudinary
    });
    
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null

    const response = await cloudinary.uploader.upload(localFilePath ,{
      resource_type : "auto"
    })
    // file has been uploaded successfully
    //console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath)
    return response;   // return for user( here user is backend server )
  } catch (error) {
    fs.unlinkSync(localFilePath) //REMOVE the locally saved temporary file as upload operation got failed  
    
  }
}









export {uploadOnCloudinary }