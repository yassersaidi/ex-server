import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export default async function uploader(uploadDir: string, fileType: string, fileName="picture") {
    return formidable({
        uploadDir: path.resolve(__dirname, `../public${uploadDir}`),
        keepExtensions: true,
        maxFileSize: 1 * 1024 * 1024,
        filename: (ext, path, form) => {
            return `${fileName}_profile${path}`
        },
        filter: (part) => {
            if (part.mimetype && part.mimetype.startsWith(fileType)) {
                return true;
            } else {
                return false;
            }
        }
    });

}

