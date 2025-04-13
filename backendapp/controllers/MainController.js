const adminModel = require("../models/Admin");
const sellerModel = require("../models/Seller");
const userModel = require("../models/User");
const { generateToken } = require("../utils/jwt/Auth");

const checkLogin = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required",
        });
    }

    try {
        // Check admin
        const admin = await adminModel.findOne({ username,password }, { _id:0,password: 0 });
        
        // console.log("Admin data:", admin);
        if (admin) {
            const username = admin.username;
            const token = await generateToken({ username,role:"admin" });
            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                role: "admin",
                data: admin,
                token:token
            });
        }

        // Check seller
        const seller = await sellerModel.findOne({
            $or: [{ sellerId: username }, { sellerEmail: username }],
            password:password
        }, { _id:0,password: 0 });
        
        if (seller) {
            const id = seller.sellerId;
            const token = await generateToken({id,role:"seller"});
            return res.status(200).json({
                success: true,
                message: "Seller login successful",
                role: "seller",
                data: seller,
                token:token
            });
        }

        // Check user
        const user = await userModel.findOne({
            $or: [{ userId: username }, { userEmail: username }],
            password:password
        }, { _id:0,password: 0 });
        
        if (user) {
            const id = user.userId;
            const token = await generateToken({id,role:"user"});
            return res.status(200).json({
                success: true,
                message: "User login successful",
                role: "user",
                data: user,
                token:token
            });
        }

        // If no match found
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const register = async(req,res)=>{
    try {
        const user = new userModel(req.body);
        await user.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Registration error:", error.message);
    }
}

module.exports = { checkLogin, register };