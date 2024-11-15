const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet'); 
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' }); 
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Middleware
app.use(cors());
app.use(helmet()); 
app.use(express.json());


const requiredEnv = ['AWS_REGION', 'AWS_S3_BUCKET_NAME'];
requiredEnv.forEach((env) => {
    if (!process.env[env]) {
        console.error(`Missing required environment variable: ${env}`);
        process.exit(1);
    }
});


app.post('/upload', upload.single('file'), async (req, res, next) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const uniqueFileName = `${uuidv4()}-${file.originalname}`;
        const fileStream = fs.createReadStream(file.path);
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: uniqueFileName,
            Body: fileStream,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
                uploadDate: new Date().toISOString(),
            },
        };

        await s3.send(new PutObjectCommand(uploadParams));
        fs.unlinkSync(file.path); 
        res.status(200).json({ message: 'File uploaded successfully!', fileName: uniqueFileName });
    } catch (err) {
        next(err); 
    }
});


app.get('/files', async (req, res, next) => {
    try {
        const listParams = { Bucket: process.env.AWS_S3_BUCKET_NAME };
        const data = await s3.send(new ListObjectsCommand(listParams));

        if (!data.Contents) {
            return res.status(200).json({ files: [] });
        }

        const files = data.Contents.map((item) => ({
            fileName: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
        }));

        res.status(200).json({ files });
    } catch (err) {
        next(err); 
    }
});


app.get('/download/:fileName', async (req, res, next) => {
    const { fileName } = req.params;

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
        });

        const url = await s3.getSignedUrl(command, { expiresIn: 3600 }); // 1-hour expiry
        res.status(200).json({ url });
    } catch (err) {
        next(err);
    }
});


app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
