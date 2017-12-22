'use strict';

const mongoose = require('mongoose');

// primero creamos el esquema
const daiSchema = mongoose.Schema({
    time: Number,
    totalSupply: String,
    circulatingSupply: String 
});

// y por último creamos el modelo
const Dai = mongoose.model('Dai', daiSchema);

// y lo exportamos
module.exports = Dai;