const mongoose = require("mongoose");

const blacklisttokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required : [true,"token is required to be added in blacklist"],
    }, 
},{
        timestamps: true,
    }
)

const blacklisttokenModel = mongoose.model("blacklistTokens",blacklisttokenSchema);

module.exports = blacklisttokenModel;