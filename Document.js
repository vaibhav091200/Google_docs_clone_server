const { Schema, model } = require("mongoose");

const Document = new Schema({
  docid: { type: String, required: true },
  data: { type: Object, required: true },
});

module.exports = model("Document", Document);
