var express = require('express');
var router = express.Router();
const moment = require('moment');
const regression = require('regression');
// cargar el modelo de dai
const Dai = require('../models/Dai');
/* GET home page. */
router.get('/', async function(req, res, next) {
  Dai.find({}).exec((err,rows) => {
     if(err){
       console.log(err);
     }else{
       const regressionData = rows.map(point => {
         return [point.time , parseInt(point.circulatingSupply)];
       });
       console.log(regressionData);
       const regressionResult = regression.linear(regressionData,{precission: 5});
       const prediccion = [];
       const prediccionLabels = [];
       const dias = 100;
       for(let i=0; i< regressionData.length; i++){
        prediccionLabels.push(moment.unix(regressionData[i][0]).format('DD/MM/YYYY HH:MM'));
         prediccion.push({
            x: moment.unix(regressionData[i][0]).format('DD/MM/YYYY HH:MM'),
            y: regressionData[i][1]
         });
       }
       let n = 0;
       for(let i= 1; i< 10; i++){
        n = regressionData[regressionData.length-1][0] + 86400*i; // tiempo 
        prediccionLabels.push(moment.unix(n).format('DD/MM/YYYY HH:MM'));
         prediccion.push({
          x: moment.unix(n).format('DD/MM/YYYY HH:MM'),
          y: regressionResult.predict( n )[1]
         });
       }
       const labels = rows.map(point => {
        return moment.unix(point.time).format('DD/MM/YYYY HH:MM');
       });
       rows = rows.map(point => {
         return {x: moment.unix(point.time).format('DD/MM/YYYY HH:MM'), y: point.circulatingSupply };
        });
        
       res.render('index', { 
         title: 'DAI Stats', 
         data: {
           daily: { 
             data: rows, 
             labels: labels
            },
            prediccionDaily: {
              data:  prediccion,
              labels: prediccionLabels
            },

          } 
        });

     }
  });
  
});

module.exports = router;
