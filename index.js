const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const fs = require('fs');
const {promisify} = require("util");
const { nextTick } = require("process");
const pipeline = promisify(require("stream").pipeline)

dotenv.config();
app.use(express.json());
app.use(cors())
app.use("/images", express.static(path.join(__dirname, "/images")));

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify:true
  })
  let db = mongoose.connection;

  db.on("connected", ()=>{
      console.log("Got the DB!")
  })
  
  db.on('error',()=>{
      console.log("Something wrong with DB connection")
  });
  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
    console.log(req.body.name)
  },
});

const upload = multer({storage : storage});
app.post("/api/upload", upload.single("file"), async (req, res, next) => {
  const {
    file, body:{name} 
  } = req
if(file.detectedFileExtension != ".jpg") next(new Error("invalid file type"))
  const fileName = name + Math.floor(Math.random * 1000)+file.detectedFileExtension

  await pipeline(file.stream, fs.createWriteStream(`${__dirname}/images/${fileName}`))
  console.log(req.file);

  res.status(200).json("File has been uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

app.listen(process.env.PORT, () => {
  console.log("Backend is running. in " + process.env.PORT);
});
