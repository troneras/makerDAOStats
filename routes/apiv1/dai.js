'use strict';

const express = require('express');
const router  = express.Router();

// cargar el modelo de anuncio
const Dai = require('../../models/Dai');


router.get('/',  async (req, res, next) => {
    const query = Dai.find({});
    const rows =  await query.exec();
    res.json({success:true, result: rows});

});

module.exports = router;