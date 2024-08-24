import fs from 'fs';
import path from 'path';

export default function readLogs(logFile:string) {
    let logs:[] = []
    const logFilePath = path.join(__dirname, logFile);
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (!err && data) {
            // If the file exists and has data, parse it
            logs = JSON.parse(data);
            return logs
        }else{
            console.error("Can't read the file", err)
            return logs
        }
    });

}