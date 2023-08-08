require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({extended:true}))
const PORT = 3000 || process.env.PORT;
app.use(express.static('public'))
app.use(express.json())
const path = require('path');
const connectDB = require('./config/db');

connectDB();
//template- engine
app.set('views',path.join(__dirname,'/views'))
app.set('view engine','ejs')
//routes
//app.use('/sendemail',require('./rooutes/sendemail'))
app.use('/',require('./routes/homepage'))
app.use('/api/files', require('./routes/files'));
app.use('/files',require('./routes/show'))
app.use('/files/download',require('./routes/download'))
app.listen(PORT, console.log(`Listening on port ${PORT}.`));

