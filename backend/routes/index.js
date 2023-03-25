var express = require('express');
var router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// cors
const cors = require('cors');
router.use(cors());


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Post. */
router.post('/vision-api', async function(req, res, next) {

  if(!req.body.base64Image) return res.status(500).send('add base 64 image in body of response')

  imageContent = req.body.base64Image

  const request = {
    image: {
      content: Buffer.from(imageContent, 'base64')
    }
  };

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');
  
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  const [result] = await client.labelDetection(request);
  // const labels = result.labelAnnotations;
  // labels.forEach(label => console.log(label.description));
  console.log('Result:');
  console.log(result);
  res.send(result).status(200)
});

module.exports = router;
