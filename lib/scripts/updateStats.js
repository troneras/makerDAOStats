'use strict';

const { MongoClient } = require('mongodb');
const request = require('request');
/**
 * You can now query the total and circulating supply of MKR and DAI through

http://api.oasisdex.com/v1/tokens/mkr/supply

http://api.oasisdex.com/v1/tokens/dai/supply

by @nik
 */
MongoClient.connect('mongodb://localhost', (err, client) => {
    if(err){
        console.log('No se puede conectar');
        process.exit(1);
    }
    const db = client.db('makerStats');    

    var optionsMkr = {
        method: 'GET',
        url: 'http://api.oasisdex.com/v1/tokens/mkr/supply',
        //headers: {'User-Agent: '...},
        json: true
    };
    var optionsDai = {
        method: 'GET',
        url: 'http://api.oasisdex.com/v1/tokens/dai/supply',
        //headers: {'User-Agent: '...},
        json: true
    };
    // load maker data
    request(optionsMkr, (err, response, body) => {
        if(err || response.statusCode >= 400){
            console.error(err, response.statusCode);
            return;
        }
        const data = {
            time: body.time,
            totalSupply: body.data.totalSupply,
            circulatingSupply: body.data.circulatingSupply
        };
        db.collection('Mkr').insertOne(data).then(result =>{
            request(optionsDai,(err, response, body) => {
                if(err || response.statusCode >= 400){
                    console.error(err, response.statusCode);
                    return;
                }
                const data = {
                    time: body.time,
                    circulatingSupply: body.data.circulatingSupply
                };
                console.log(data);
                db.collection('Dai').insertOne(data)
                .then(result => {
                    console.log("OK: makerstats actualizada correctamente");
                    // Cerramos la conexión a la bbdd
                    client.close();
                })
                .catch(err => {console.log(err);});
            });
        }).catch(err => {/* No importa que no existan */});
        
    });
    


    

});