const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const cors = require('cors'); // Importing CORS
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });  // Temp folder for uploaded files
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Enable CORS for all routes
app.use(cors());

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const fileStream = fs.createReadStream(file.path);
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: file.originalname,  // Using the original name to avoid conflicts
            Body: fileStream,
        };

        // Upload to S3
        await s3.send(new PutObjectCommand(uploadParams));
        fs.unlinkSync(file.path);  // Remove file from local storage after upload
        res.status(200).send('File uploaded successfully!'); // Return 200 status
    } catch (err) {
        console.error('Error details:', err);  // Log the error details
        res.status(500).send('Error uploading file: ' + err.message);
    }
});

// Endpoint to retrieve the list of files from S3
app.get('/files', async (req, res) => {
    try {
        const listParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        const data = await s3.send(new ListObjectsCommand(listParams));
        
        // Map the results to include file names and URLs
        const files = data.Contents.map(item => ({
            fileName: item.Key,
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
        }));

        res.status(200).json(files); // Return files with a 200 status
    } catch (err) {
        console.error('Error retrieving files:', err); // Log error for debugging
        res.status(500).send('Error retrieving files: ' + err.message);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});