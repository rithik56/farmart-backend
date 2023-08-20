require('dotenv').config()

const cors = require('cors')
const formidable = require('formidable')
const express = require('express')
const fs = require('node:fs')
const mongoose = require('mongoose');

const { uploadFile, getTinyURL, getFileStream } = require('./helper')

const File = require('./File')

mongoose.connect(process.env.MONGODB_CONNECT_URI)
  .then(() => console.log('connected successfully'))
  .catch((err) => console.log(err))

const app = express()
const port = process.env.PORT

app.use(cors())

app.get('/images/:key', (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)
  readStream.pipe(res)
})

app.post('/upload', async (req, res) => {


  const form = new formidable.IncomingForm();

  form.parse(req, async function (err, fields, files) {

    try {

      const fileData = files.files[0]
      const { originalFilename, size, mimetype, filepath } = fileData

      const rawData = fs.readFileSync(filepath)
      const result = await uploadFile(originalFilename, rawData)
      const shortUrl = await getTinyURL(`${process.env.BASE_URL}/images/${result.Key}`)

      const count = await File.count({ name: originalFilename })

      if (count === 0) {

        await File.create({
          url: shortUrl,
          name: originalFilename,
          mimetype,
          size
        })

        res.status(200).send({
          shortUrl: shortUrl
        })

      }


      else {
        throw 'file with this name and type already exists'
      }

    } catch (err) {
      console.log(err)
      res.status(400).send(err)

    }

  })

})

app.get('/files', async (req, res) => {
  try {
    const files = await File.find()
    res.send({
      files
    })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.listen(port);