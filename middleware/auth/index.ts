import rateLimit from "express-rate-limit";
import fs from 'fs';
import path from 'path'

export const authLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many attempts from this IP, please try again after 10 minutes',

    handler: (req, res, next, options) => {
        // Log the request details to a file
        const logFilePath = path.join(__dirname, '../../logs/rateLimitExceeded.json');
        const logEntry = {
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            headers: req.headers,
            timestamp: new Date().toISOString()
        };
        

        fs.readFile(logFilePath, 'utf8', (err, data) => {
            let logs = [];
    
            if (!err && data) {
                // If the file exists and has data, parse it
                logs = JSON.parse(data);
            }
    
            // Add the new log entry
            logs.push(logEntry);
    
            // Write the updated logs back to the file
            fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Failed to write to log file:', writeErr);
                }
            });
        });

        
        res.status(options.statusCode).json({ error: options.message });
    }
});
