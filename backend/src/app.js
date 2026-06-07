const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")



app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

const authrouter = require("./routes/auth.route");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth",authrouter);
app.use("/api/interview",interviewRouter);

module.exports = app;
