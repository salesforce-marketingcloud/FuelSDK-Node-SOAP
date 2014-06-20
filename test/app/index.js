var express = require('express');
var http = require('http');
var app = module.exports = express();


app.get('/auth', function(req, res) {
  res.send('it is authenticated');
});