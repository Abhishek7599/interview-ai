const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")



app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "https://interview-ai-three-dusky.vercel.app"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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
