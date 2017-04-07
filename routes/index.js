var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* Example 1 */
router.get('/1', (req, res, next) => {
  res.render('one');
});
router.get('/4', (req, res, next) => {
  res.render('four');
});
router.get('/5', (req, res, next) => {
  res.render('five');
});

module.exports = router;
