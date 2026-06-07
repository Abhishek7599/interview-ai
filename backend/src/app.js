const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")



app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app"); // 🔥 FIX

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

const authrouter = require("./routes/auth.route");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth",authrouter);
app.use("/api/interview",interviewRouter);

module.exports = app;
