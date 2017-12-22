'use strict';

const mongoose = require('mongoose');

// primero creamos el esquema
const mkrSchema = mongoose.Schema({
    time: Number,
    totalSupply: String,
    circulatingSupply: String 
});

// y por último creamos el modelo
const Mkr = mongoose.model('Mkr', mkrSchema,'Mkr');

// y lo exportamos
module.exports = Mkr;