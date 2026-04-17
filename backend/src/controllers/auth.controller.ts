import {userModel}  from "../model/auth.model.js";
import bcrypt from "bcryptjs"
import jwt from  "jsonwebtoken"


export const register = async(req,res)=>{

    const {username, email, password} = req.body;

    const isAlreadyExist = await userModel.findOne({
        $or :[
            {username},
            {email},
        ]
    })

     if(isAlreadyExist){
        return res.status(400).json({
            message: "invalid credentials"
        })
     }

     const hash = await bcrypt.hash(password,10);

     const user = await userModel.create({
        username, 
        email,
        password:hash
     })

     const token = jwt.sign({
         id : user._id,
         username : user.username
     },
      process.env.JWT_SECRET,
      {expiresIn : "1d"}
    )

    res.cookie("toekn",token);

    res.status(201).json({
        message : "user successfully register..",

        user : {
            id: user._id,
            email : user.email,
            username : user.username
        }

    })


}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username
        },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token);

        res.status(200).json({
            message: "User successfully logged in",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
