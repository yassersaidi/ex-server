import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default function generateReqLog(logfile: string, action: string, req: Request) {
    const logEntry = {
        id: uuidv4(),
        time: new Date().toISOString(),
        action: action,
        path: req.path,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body:req.body,
        ip: req.ip
    };
    const logFilePath = path.join(__dirname, logfile);

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
}