const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")



app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

const authrouter = require("./routes/auth.route");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth",authrouter);
app.use("/api/interview",interviewRouter);

module.exports = app;
