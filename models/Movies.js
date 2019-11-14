const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schemaName = new Schema({
  genre: [
    {
      type: String,
      enum: ["horror", "comedy"]
    }
  ],
  director: String,
  year: Number,
  title: String,
  duration: String,
  rate: Number
});

const Model = mongoose.model("Movies", schemaName);
module.exports = Model;
