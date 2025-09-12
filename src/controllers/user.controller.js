import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req,res) => {
    // get required data of user from frontend
    // validation - not empty
    // check if user already exists or not :username,email
    // check for images, check for avatar
    // upload them to cloudinary if exists,avtar
    // create user object - create entry in db (.create)
    // remove password and refresh token field from response
    // check for user creation 
    //response return 

    const {fullName,email,username,password} =req.body
    console.log("email: ",email);

    // if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    // }

    if (
       [fullName,email,username,password].some((field)=> field?.trim()=== "") 
    ) {
        throw new ApiError(400,"All fields are required");
    }
    
    const existedUser=User.findOne({
        $or: [ {username} , {email} ]
    })
    
    if(existedUser) {
        throw new ApiError(409, "user with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const User= await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(User._id).select(
        "-password - refreshToken"
    )

   if (!createdUser) {
    throw new ApiError(500,"something went wrong while registering a user");
   }

  return res.status(201).json(
    new ApiResponse(200, createdUser,"User registered Successfully")
  )

})

export {registerUser}