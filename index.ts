import { Application } from "express"

var cookieParser = require('cookie-parser')
import cors from 'cors';

const express = require('express')
const app: Application = express()

app.use(cors());
app.use(express.json());
app.use(cookieParser())


const auth = require("./routes/auth")
const user = require("./routes/user")
app.use("/auth", auth)
app.use("/user", user)

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server started on port ${process.env.SERVER_PORT}`);
});