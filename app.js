require('dotenv').config()

const cors = require('cors')
const multer = require('multer')
const express = require('express')
const fs = require('fs')
const util = require('util')
const mongoose = require('mongoose');

const { uploadFile, getTinyURL, getFileStream } = require('./helper')
const unlinkFile = util.promisify(fs.unlink)

const File = require('./File')

mongoose.connect(process.env.MONGODB_CONNECT_URI)
  .then(() => console.log('connected successfully'))
  .catch((err) => console.log(err))

const app = express()
const port = process.env.PORT || 8000

app.use(cors())

const upload = multer({ dest: 'uploads/' })

app.get('/images/:key', (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)
  readStream.pipe(res)
})

app.post('/upload', upload.single('file'), async (req, res) => {

  try {
    const fileData = req.file
    const { originalname, path, size, mimetype, encoding } = fileData

    const result = await uploadFile(fileData)
    await unlinkFile(path)

    const shortUrl = await getTinyURL(`${process.env.BASE_URL}/images/${result.Key}`)

    const count = await File.count({ name: originalname })

    if (count === 0) {

      const file = await File.create({
        url: shortUrl,
        name: originalname,
        mimetype,
        encoding,
        size
      })

      res.send({
        shortUrl: shortUrl
      })

    }

    else {
      res.status(400).send('File with this name already exists')
    }

  } catch (err) {
    res.send(err)
  }

})

app.get('/files', async (req, res) => {
  try {
    const files = await File.find()
    res.send({
      files
    })
  } catch(err) {
    console.log(err)
  }
})

app.listen(port);