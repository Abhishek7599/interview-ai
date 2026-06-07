require("dotenv").config();

const app = require("./src/app");
const connecttodb = require("./src/config/database");

const port = process.env.PORT || 3000;

connecttodb();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});