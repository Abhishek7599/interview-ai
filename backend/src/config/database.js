const mongoose = require("mongoose");

async function connecttodb(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to database")

    }
    catch(err){
        console.log(err);
    }

}

module.exports = connecttodb;