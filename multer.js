
const express = require("express")
const app = express()
const http = require("http").createServer(app)
const mongoClient = require("mongodb").MongoClient
const formidable = require("express-formidable")
const mongoose = require('mongoose');
const multer = require('multer');
const dbs = require("./data")
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');




mongoose.connect("mongodb://localhost:27017/neheraldnews", {
   useNewUrlParser: true,
   useUnifiedTopology: true
});


// mongoose.connect('mongodb+srv://birajit_dev:*67Birajit_dev@ne-surf.g7a62.mongodb.net/neSurf?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log('Connected')
});


// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
   
   
// var upload = multer({ 
//     storage: storage }).array('myFile','5');




const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId:'DO00YCW72DZT2Q6WMMFF',
  secretAccessKey:'SQyXsV6kK6GsQHEUlFTCjfQ2LyKmSnAiPqAn4MAmMrc'
});

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'northeastherald',
      acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        cb(null,'uploads/'+ file.originalname);
      }
    })
  }).array('myFile', 5);


app.post('/upimage', async function(req, res){

    upload(req, res, (error) => {
        console.log('files', req.files);
        if (error) {
            console.log('errors', error);
            res.status(500).json({
                status: 'fail',
                error: error
            });
        } else {
            // If File not found
            if (req.files === undefined) {
                console.log('uploadProductsImages Error: No File Selected!');
                res.status(500).json({
                    status: 'fail',
                    message: 'Error: No File Selected'
                });
            } else {
                // If Success
                let fileArray = req.files,
                    fileLocation;
                const images = [];
                for (let i = 0; i < fileArray.length; i++) {
                    fileLocation = fileArray[i].key;
                    console.log('filenm', fileLocation);
                    images.push(fileLocation)
                }
                let inse = new dbs({
                    images: images
                });
                inse.save();
                // Save the file name into database
                return res.status(200).json({
                    status: 'ok',
                    filesArray: fileArray,
                    locationArray: images,
                });

                

            }
        }
    })
})


app.set("view engine", "ejs")
app.get("/", async function (request, result) {
    result.render("home")
})
 


 
const fileSystem = require("fs")
//const { db } = require("./data")
app.use("/uploads", express.static(__dirname + "/uploads"))


const port = process.env.PORT || 3000
http.listen(port, function () {
    console.log("Server started running at port: " + port)
 
    // [connect Mongo DB]
})