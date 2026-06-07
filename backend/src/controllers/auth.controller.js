const usermodel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const blacklisttokenModel = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @description register a new user,expects username,email and password in the request body
 * @access public
 */
async function registerUserController(req,res) {
    const{username,email,password} = req.body

    if(!username ||!email || !password){
        return res.status(400).json({
            message: "Please provide username,email and password"
        })
    }

    const isUserAlreadyExist = await usermodel.findOne({
        $or: [{username},{email}]
    })
    if(isUserAlreadyExist){
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }
    const hash = await bcrypt.hash(password,10);
    const user = await usermodel.create({
        username,
        email,
        password:hash
    })
    const token = jwt.sign(
        { id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )
    res.cookie("token",token)

    res.status(201).json({
        message: "User Registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })

};

/**
 * @name loginUserController
 * @description login a user with email and password
 * @access public
 */
async function loginUserController(req,res) {
    const {email,password} = req.body

    const user = await usermodel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "Email or Password is invalid"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        return res.status(400).json({
            message: "Email or Password is invalid"
        })
    }

    const token = jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}

    )

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
});
    res.status(200).json({
        message: "User LoggedIn Successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}
/**
 * 
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blaclist
 * @access Public 
 */

async function logoutUserController(req,res){
    const token = req.cookies.token;

    console.log("Token:", token);
    if(token){
        await blacklisttokenModel.create({token});
    }
    res.clearCookie("token");

    res.status(200).json({
        message:"User logged out successfully",
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access Private
 */

async function getMeController(req,res){
    const user = await usermodel.findById(req.user.id)

    res.status(200).json({
        message: "User detail fetched successfully",
        user:{
            id: user._id,
            username : user.username,
            email: user.email,
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}