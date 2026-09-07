import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) =>{
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(400, "user not found")
    }
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // Saving of refresh token in database 
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave : false })

    return { accessToken, refreshToken }


  } catch (error) {
    console.log(error);
    
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}


const registerUser = asyncHandler ( async( req, res) => {
  // get user details from frontend
  // validations - not empty
  // check if user already exists:username, email
  // check for images , check for avatar
  // upload them to cloudinary specially avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

// get user details from frontend
 const{fullName, email, username, password}= req.body
 //console.log("email:",email);

// validations - not empty
// if (fullName === "") {
//   throw new ApiError(400, "ALL fields are required")
// }

if ([fullName, email, username, password].some((fields) => fields?.trim === "")) {
  throw new ApiError(400, "all fields are required")
}

// check if user already exists:username, email
const userExisted = await User.findOne({
  $or: [{username},{email}]
})

if (userExisted) {
  throw new ApiError (409, "email or username already exists")
}

//console.log(req.files);

// check for images , check for avatar
// multer gives us access of files
// Since access of files is not necessary so we optionally chained
const avatarLocalPath = req.files?.avatar[0]?.path   // returns respose of path of files uploaded on server
//const coverImageLocalPath = req.files?.coverImage[0]?.path

let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  coverImageLocalPath = req.files.coverImage.path
}

if (!avatarLocalPath) {
  throw new ApiError (400, "Avatar file is required")
}
 // upload them to cloudinary specially avatar
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
  throw new ApiErrorO(400, "Avatar file is required")
}

// create user object - create entry in db
const user = await User.create({
  fullName,
  avatar : avatar.url,
  coverImage : coverImage?.url || "",
  email,
  password,
  username : username.toLowerCase()
})
// check if user has been created or not(you can check it dierectly by if statement but better is :)
 const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
 )
if (!createdUser) {
  throw new ApiError(500, "Something went wrong while registering the user")
}
//  crafting of response
return res.status(201).json(
  new ApiResponse(200, createdUser, "User registered successfully")
)
})



const loginUser = asyncHandler(async (req, res) =>{
  // TODOS:
  // req body -> data (fetch data from req body)
  // check if username or email exists
  // find the user
  // check the password
  // access token or refresh token
  // send cookie

  // req body -> data (fetch data from req body)
  const {email, username, password} = req.body
  console.log(email);
  

  if (!username && !email ) {
    throw new ApiError(400, "username or email is required")
  }
   // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }


  // find the user
  const user = await User.findOne({
    $or : [{username}, {email}]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  // check the password
  const isPasswordValid = await user.isCorrectPassword(password)  
  
  if (!isPasswordValid) {
    throw new ApiError(401, " Invalid User Credentials !")
  }
 // access token or refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
//  Note : here user taken has no refreshToken(  refresh token field is empty) because method for refresh token is called after taking user instance , either you update the user with refresh token object or make one more database query(easier one )

const loggedInuser = await User.findById(user._id).select( "-password -refreshToken")

// send cookie
const options = {
  httpOnly : true,
  secure : true
}
// send cookie
     
return res
.status(200)
.cookie("accessToken", accessToken, options)       //sending and setting cookie
.cookie("refreshToken", refreshToken, options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInuser, accessToken, refreshToken
    },
    "User logged In successfully"
  )
)




})
 
// logout user
const logoutUser = asyncHandler(async(req, res) =>{
  // TODOS : Clear all cookies which is manageable via server only
  // here difficult task  is to find user

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set :{ 
        refreshToken : undefined
      }
    },
    {
      new : true             // provide new updated value
    }
  )
  // send new cookies
  const options = {
  httpOnly : true,
  secure : true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(
  new ApiResponse(200, {}, "user logged out")
)
})

// endpoint for user where they can get their token refreshed using refresh token

const refreshAccessToken = asyncHandler( async(req, res) =>{
  const incomingRefresToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (!incomingRefresToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  
  try {
    const decodedToken = jwt.verify(
      incomingRefresToken,
      process.env.REFRESH_TOKEN_SECRET
    )
     
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }
  
    // match the incoming refresh token with refresh token saved in database
    
    if (incomingRefresToken != user?.refreshToken) {
      throw new ApiError(401, "refresh token has been expired or used")
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
  
    return  res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
      {accessToken, refreshToken: newRefreshToken},
      "Access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})
export { 
  registerUser, 
  loginUser,
  logoutUser,
  refreshAccessToken

}