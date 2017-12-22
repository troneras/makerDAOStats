'use strict';

const express = require('express');
const router  = express.Router();

// cargar el modelo de anuncio
const Mkr = require('../../models/Mkr');


router.get('/',  (req, res, next) => {
    const query = Mkr.find({});
    const rows =  query.exec();
    res.json({success:true, result: rows});
});

module.exports = router;