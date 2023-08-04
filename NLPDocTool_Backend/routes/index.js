// import fetch from "node-fetch";

var express = require('express');
var router = express.Router();

const crypto = require('crypto');
const util = require('util');
const stream = require('stream');
const { finished } = require('stream');
const { promisify } = require('util');
const hash = crypto.createHash('sha1');
hash.setEncoding('hex');

const pipeline = util.promisify(stream.pipeline);

var fs = require("fs");
var { parse } = require("csv-parse");

var multer  = require('multer');

const finishedAsync = promisify(finished);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, 'public')
},
filename: function (req, file, cb) {
  cb(null, Date.now() + '-' +file.originalname )
}
})
var upload = multer({ storage: storage }).single('file')

// originally thought i'd have to change the routes here,
// but just changing them in NLPDocTool_Backend/app.js indexRouter works :D

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.post('/processFile', async function (req, res) {

   upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }

    var array = [];
    const readable = fs.createReadStream("./public/"+req.file.filename)
    .pipe(parse({ relax_quotes: true, delimiter: ",", from_line: 1, columns: ['contextName', 'input'] }))
    .on("data", function (row) {
      array.push(row);
      console.log(array);
    })

    await finishedAsync(readable);


  console.log(array);

  return res.status(200).send(array) })


  
  // var file = req.file;

  // console.log(file);

  // return res.status(200).send({file: file})

  
});


// note: this probably won't be run, we'll be trying to just use /user_model/predict
router.post('/runPrediction', async function (req, res) {

  var API_TOKEN="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";
  console.log(req.body);
  async function query(data) {
    
    const response = await fetch(
        "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
        {
          headers: { 
            Authorization: `Bearer ${API_TOKEN}` 
            
          },
          method: "POST",
          
          body: data,
        }
    );
    const result = await response.json();
    console.log(result)
    return result;
}
  query(req.body.input).then((response) => {
    // console.log(req.body.input);
    var object = response
    console.log(response);
    var string = "sucess"
    var string = JSON.stringify(object[req.body.outputName]);
    // console.log(string);
      return res.status(200).send(string)
  });
 
});

// I, Jess, do plan on this staying in use for the hypothesis comparison
router.post('/getSimilarity', async function (req, res) {

  var API_TOKEN="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";

  async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}
  query({inputs:{
    source_sentence: req.body.one,
    sentences: [req.body.two]
    }}).then((response) => {
      var score = response[0]
      console.log(score);
      return res.status(200).send(JSON.stringify(score))
    });
 
});

module.exports = router;
