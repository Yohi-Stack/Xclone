import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken  from "../utils/generateToken.js";



export const signup  = async (req,res)=>{
try {
    const {username, fullName, email, password} = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
       return res.status(400).json({error:"Invalid email Format"});
    }

    const existingEmail = await User.findOne({email})
    const existingUserName = await User.findOne({username})
   
    if(existingEmail || existingUserName ){
       return res.status(400).json({error:"Already Existing Username or email"});
    }
    if(password.length < 6 ){
        return res.status(400).json({error:"Password must have atleast 6 characters"})
    }

    //hashing the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        username,
        fullName,
        email,
        password : hashedPassword
    })

    if(newUser){
        generateToken(newUser._id, res)
        await newUser.save();
        res.status(200).json({
            _id : newUser._id,
            username : newUser.username,
            fullName : newUser.fullName,
            email : newUser.email,
            followers : newUser.followers,
            following : newUser.following,
            profileImg : newUser.profileImg,
            coverImg : newUser.coverImg,
            bio : newUser.bio,
            link : newUser.link
        })
    }
    else{
        res.status(400).json({error:"Invalid user data"});
    }
} catch (error) {
    console.log(`Error in signup controller:${error}`);
    return res.status(500).json({error:"Internal Server Error"})
}
}

export const login  = async (req , res) => {
   try {
     console.log("Login body:", req.body); 
    const { username, password } = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    // const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid Username or Password"})
        }

        generateToken(user._id, res); // only sets cookie

        res.status(200).json({
            _id : user._id,
            username : user.username,
            fullName : user.fullName,
            email : user.email,
            followers : user.followers,
            following : user.following,
            profileImg : user.profileImg,
            coverImg : user.coverImg,
            bio : user.bio,
            link : user.link
        });
   } catch (error) {
    console.log(`Error in login controller:${error}`);
    return res.status(500).json({error:"Internal Server Error"})

   }
}

export const logout  = async (req,res)=>{
   try {
    res.cookie("jwt", "", {maxAge : 0})
    res.status(200).json({message:"logout successfully"})
   } catch (error) {
    console.log(`Error in logout controller:${error}`);
    return res.status(500).json({error:"Internal Server Error"})

   }
}

export const getMe = async (req,res) =>{
    try {
        console.log(`User ID: ${req.user._id}`);
        const user = await User.findOne({_id : req.user._id}).select("-password");
       
        if (!user) {
      return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
       
    } catch (error) {
        console.log(`Error in getMe controller:${error}`);
        return res.status(500).json({error:"Internal Server Error"})
    
    }
}