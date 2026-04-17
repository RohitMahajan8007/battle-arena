import dotenv from "dotenv"
 dotenv.config();
import app from "./src/app.js";
import { ConnectToDB } from "./src/config/database.js";




ConnectToDB()
app.listen(3000,()=>{
    console.log("server is running...")
})