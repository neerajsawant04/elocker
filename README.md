# eLocker - A Secure File Storing Platform.

eLocker is a secure platform that allows users to upload, store, and manage their files online. Built using Node.js and AWS S3, eLocker provides a user-friendly interface for accessing files anytime, anywhere.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)

## Features
- **Secure File Uploading**: Users can easily upload files to their eLocker.
- **File Retrieval**: Retrieve a list of stored files with direct access links.


## Technology Stack
- **Frontend**: HTML, CSS, JavaScript.
- **Backend**: Node.js, Express.js, Multer.
- **Cloud Storage**: Amazon S3 for secure file storage

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- An AWS account with S3 permissions
- Basic knowledge of JavaScript/Typescript and Node.js

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/neerajsawant04/elocker-Secure-Storage-AWS.git
   cd elocker
   npm install
2. Create a .env file in the root directory and add your AWS configuration:
   ```bash
      AWS_REGION=your_aws_region
      AWS_S3_BUCKET_NAME=your_bucket_name
      AWS_ACCESS_KEY_ID=your_access_key
      AWS_SECRET_ACCESS_KEY=your_secret_key
3. Start the server:
   ```bash
    node app.js
