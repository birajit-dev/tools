const express = require("express")
const app = express()
const http = require("http").createServer(app)
const mongoClient = require("mongodb").MongoClient
const formidable = require("express-formidable")
const mongoose = require('mongoose');
const allNews = require("./newsdb")
const fetch = require('node-fetch');
const jdata = require('./news.json')


const dbs = require("./data")


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

app.set("view engine", "ejs")

 


app.use(formidable({
    multiples: true, // request.files to be arrays of files
}))
 
const fileSystem = require("fs")
//const { db } = require("./data")
app.use("/uploads", express.static(__dirname + "/uploads"))
// [include Mongo DB]
 
// [set view engine]
 
// [Express formidable and FS module]
 
// [recursive function to upload images]
app.post("/uploadImages", async function (request, result) {
    const images = []
    if (Array.isArray(request.files.images)) {
        for (let a = 0; a < request.files.images.length; a++) {
            images.push(request.files.images[a])
        }
    } else {
        images.push(request.files.images)
    }
 
    callbackFileUpload(images, 0, [], async function (savedPaths) {
        let inse = new dbs({
            images: savedPaths
        });
        inse.save();
        // await dbs.insertOne({
        //     images: savedPaths
        // })
 
        result.send("Images has been uploaded.")
    })
})


function callbackFileUpload(images, index, savedPaths = [], success = null) {
    const self = this
 
    if (images.length > index) {
 
        fileSystem.readFile(images[index].path, function (error, data) {
            if (error) {
                console.error(error)
                return
            }
 
            const filePath = "uploads/" + new Date().getTime() + "-" + images[index].name
             
            fileSystem.writeFile(filePath, data, async function (error) {
                if (error) {
                    console.error(error)
                    return
                }
 
                savedPaths.push(filePath)
 
                if (index == (images.length - 1)) {
                    success(savedPaths)
                } else {
                    index++
                    callbackFileUpload(images, index, savedPaths, success)
                }
            })
 
            fileSystem.unlink(images[index].path, function (error) {
                if (error) {
                    console.error(error)
                    return
                }
            })
        })
    } else {
        success(savedPaths)
    }
}

app.get("/", async function (request, result) {
    const images = await db.collection("images").find({}).toArray()
    result.render("home", {
        images: images.length > 0 ? images[0].images : []
    })
})

app.get("/json", function(request, result){


    result.send(jdata)
    
})



app.get("/up", async function(request, result, next){
    //let url = "https://www.indiablooms.com/news/feeds.json";


    let url = "http://185.187.235.107:8080/json";
    const dashAllNews = await allNews.find().sort({ibns_id:-1}).lean();

    let settings = { method: "Get" };
    fetch(url, settings)
    .then(res => res.json())
    .then((json) => {

        //console.log(json.news.tripura)

        var sports = json.news.tripura;            
            if(sports !=null){  
                for(var i=0;i<sports.length;i++){     
                    if(sports[i].content.length>10){  
                        var selected=dashAllNews.filter(it =>
                        it.ibns_id === sports[i].id 
                        );        
                        if(selected != null && selected.length>0){
                        }
                        else{
                            var iurl = sports[i].title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                            var urls = "https://northeastherald.sfo3.digitaloceanspaces.com/tripura/";
                            var replace = sports[i].publishedAt.replace('Agartala,','');
                            var imagePath = urls + sports[i].imageName;
                            let ipage = new allNews({
                            post_name: sports[i].title,
                            post_url: iurl,
                            post_summary: sports[i].description,
                            post_content:sports[i].content,
                            post_keyword:'agartala news, tripura news, northeast herald, sports news',
                            meta_description:sports[i].description,
                            post_category:'tripura',
                            post_image:imagePath,
                            meta_tags:'Tripura News',
                            post_topic:'',
                            post_editor:'No',
                            ne_insight:'No',
                            author:'NE Herald',
                            update_date:replace,
                            ibns_id:sports[i].id
                            });
                            ipage.save();      
                        }        
                    }
                }
            
            }
    })
})





 
const port = process.env.PORT || 8080
http.listen(port, function () {
    console.log("Server started running at port: " + port)
 
    // [connect Mongo DB]
})