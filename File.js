const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    url: String,
    name: String,
    mimetype: String,
    encoding: String,
    size: Number
})

module.exports = mongoose.model("File", FileSchema)