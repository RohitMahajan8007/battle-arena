import mongoose from "mongoose"


export async function ConnectToDB(){
       await mongoose.connect(process.env.MONGO_URI)
       .then(()=>{
        console.log("Connect Database...")
       })
       .catch(err=>{console.log(err.message)})
}