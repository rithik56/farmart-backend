const AWS = require('aws-sdk');
const fs = require('fs')

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION
const Bucket = process.env.S3_BUCKET;

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
});

const getTinyURL = async (url) => {
    try {
        let response = await fetch(`https://api.tinyurl.com/create?api_token=${process.env.API_TOKEN}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url
            })
        });
        response = await response.json()
        return response.data.tiny_url;
    } catch (err) {
        throw 'unable to shorten the url'
    }
}

const uploadFile = (fileName, rawData) => {

    const params = {
        Bucket,
        Key: fileName,
        Body: rawData
    }

    return s3.upload(params).promise()

}

const getFileStream = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket
    }
    return s3.getObject(downloadParams).createReadStream()
}

module.exports = {
    uploadFile,
    getTinyURL,
    getFileStream
}