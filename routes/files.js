const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb
// Assuming you have already imported the necessary modules and defined the 'upload' middleware.

// POST request handler for file upload

router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
      const file = new File({
          filename: req.file.filename,
          uuid: uuidv4(),
          path: req.file.path,
          size: req.file.size
      });
      const response = await file.save();
      filelink= `${process.env.APP_BASE_URL}/files/${response.uuid}` ;
      res.render('sendemail',{
        link:filelink,
        uuid:response.uuid
      })
      
    });
});


router.post('/send', async (req, res) => {
  console.log(req.body)
  const { uuid, emailTo, emailFrom} = req.body;
  console.log(1)
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required'});
  }
  // Get data from db 
  try {
    const file = await File.findOne({ uuid: uuid });
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/emailService');
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharin',
      //text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
                emailFrom, 
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
    }).then(() => {
       
        return res.send('File has been sent sucessfully');
    }).catch(err => {
      return res.status(500).json({error: err});
    });
    } 
    catch(err) {
       return res.status(500).send({ error: err});
               }

});

module.exports = router;