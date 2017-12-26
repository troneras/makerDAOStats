var express = require('express');
var router = express.Router();
const moment = require('moment');
const regression = require('regression');
var returnOnInvestment = require('capitaljs').returnOnInvestment;
// cargar el modelo de dai
const Dai = require('../models/Dai');

const mkrSupply = 1000000; 
const expectedReturnPerYear = 7;
const fee = 0.01;
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
          
       var prediccion = [];
       var prediccionLabels = [];
       const dias = 365;
       for(let i=0; i< regressionData.length; i++){
        prediccionLabels.push(moment.unix(regressionData[i][0]).format('DD/MM/YYYY'));
         prediccion.push({
            x: moment.unix(regressionData[i][0]).format('DD/MM/YYYY'),
            y: regressionData[i][1]
         });
       }
       let n = 0;
       for(let i= 1; i< dias; i++){
        n = regressionData[regressionData.length-1][0] + 86400*i; // tiempo 
        prediccionLabels.push(moment.unix(n).format('DD/MM/YYYY'));
         prediccion.push({
          x: moment.unix(n).format('DD/MM/YYYY'),
          y: regressionResult.predict( n )[1]
         });
       }
       
       
       
       // regression polynomial
       let dataPoly = JSON.parse(JSON.stringify(regressionData));
       for(let i=0; i<regressionData.length;i++){
        dataPoly[i][0] = i+1;
       }
       dataPoly = [[0, 4581122], [1, 5200735], [2, 5872583], [3, 6677607]];
       //              220000000
      //  const regressionTwo = JSON.parse(JSON.stringify(regression));
       console.log(dataPoly);
       const regressionPolResult = regression.polynomial(dataPoly,{order:2});
       console.log(regressionPolResult.predict(15));

       const prediccionPol = [];
       const prediccionPolLabels = [];
       
       for(let i=0; i< regressionData.length; i++){
        prediccionPolLabels.push(moment.unix(regressionData[i][0]).format('DD/MM/YYYY'));
         prediccionPol.push({
            x: moment.unix(regressionData[i][0]).format('DD/MM/YYYY'),
            y: regressionData[i][1]
         });
       }
       n = 0;
       for(let i= 1; i< dias; i++){
        n = regressionData[regressionData.length-1][0] + 86400*i; // tiempo 
        prediccionPolLabels.push(moment.unix(n).format('DD/MM/YYYY'));
        const p = regressionPolResult.predict( i )[1];
        // console.log("Predicción para "+i+": "+p);
         prediccionPol.push({
          x: moment.unix(n).format('DD/MM/YYYY'),
          y: p
         });

       }

       // Growth model
       var prediccionValue = JSON.parse(JSON.stringify(prediccionPol));
       for(let i=0; i<prediccionValue.length; i++){
          prediccionValue[i].y = (((prediccionValue[i].y * fee)/mkrSupply)*100)/expectedReturnPerYear;
       }

       const labels = rows.map(point => {
        return moment.unix(point.time).format('DD/MM/YYYY');
       });
       rows = rows.map(point => {
         return {x: moment.unix(point.time).format('DD/MM/YYYY'), y: point.circulatingSupply };
        });
        
       const incrementFromZero = returnOnInvestment( {
        earnings: rows[rows.length-1].y,
        initialInvestment: rows[0].y
      } ).percent;
      const incrementFromLastDay = returnOnInvestment( {
        earnings: rows[rows.length-1].y,
        initialInvestment: rows[rows.length-2].y
      } ).percent;
       res.render('index', { 
         title: 'DAI Stats', 
         incrementFromZero : incrementFromZero,
         incrementFromLastDay: incrementFromLastDay,
         data: {
           daily: { 
             data: rows, 
             labels: labels
            },
            prediccionDaily: {
              data:  prediccion,
              labels: prediccionLabels
            },
            prediccionGrowth: {
              data: prediccionValue,
              labels: prediccionLabels
            },
            prediccionPolDaily:{
              data: prediccionPol,
              labels: prediccionPolLabels
            }

          } 
        });

     }
  });
  
});

module.exports = router;
