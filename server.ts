
const express = require('express');
const app = express();
import * as bodyParser from 'body-parser';


// const route = require('./products.route');

import router from './products.route'
app.use(bodyParser.json({ limit: '50MB' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

app.listen(4000, () => {
    console.log("started")
})
