const mongoose = require("mongoose");
const Document = require("./Document");
require("dotenv").config();
console.log(process.env.MONGOURI);

try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    process.env.MONGOURI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => console.log(" Mongodb is connected")
  );
} catch (e) {
  console.log("could not connect");
}

const io = require("socket.io")(process.env.PORT || 3001, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    console.log(typeof documentId);
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    console.log(document);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      const document = await Document.findOne({ docid: documentId });

      document.data = data;
      await document.save();
    });
  });
});

const findOrCreateDocument = async (id) => {
  if (id == null) return;
  console.log(id);
  const document = await Document.findOne({ docid: id });
  console.log(document);
  if (document) return document;

  return await Document.create({ docid: id, data: defaultValue });
};
