import { Application } from "express"

var cookieParser = require('cookie-parser')


const express = require('express')
const app: Application = express()

app.use(express.json());
app.use(cookieParser())


const auth = require("./routes/auth")
const user = require("./routes/user")
app.use("/auth", auth)
app.use("/user", user)

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server started on port ${process.env.SERVER_PORT}`);
});