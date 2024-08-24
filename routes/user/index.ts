import express, { Express, Request, Response , Application, NextFunction } from 'express';
const router = express.Router()

// middleware that is specific to this router
const timeLog = (req:Request, res:Response, next:NextFunction) => {
    console.log(req)
    console.log('Time: ', new Date())
    next()
}
router.use(timeLog)

router.get('/login', (req:Request, res:Response) => {
    res.send('Login')
})

router.get('/register', (req:Request, res:Response) => {
    res.send('Register')
})

module.exports = router