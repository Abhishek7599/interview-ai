require("dotenv").config();
const app = require("./src/app");
const connecttodb = require("./src/config/database");
connecttodb();




app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})