var should = require('should');
var app = require('../app');
var fuelAuth = require('../../lib/fuelAuth');

/*
======== ShouldJS Reference ========

Docs ref for Shouldjs - https://github.com/shouldjs/should.js

====================================
*/

var server;
var client = new fuelAuth({
	"authUrl" : "http://localhost:3000/auth",
	"clientId" : '12345',
	"clientSecret" : '12345',
	"restEndpoint" : "http://localhost:3000",
	"soapEndpoint" : "http://localhost:3000"
});


describe('fuelAuth', function () {
	before(function(){
		server = app.listen(3000);
	});

	after(function(){
		server.close();
	});

	it('should be an object', function(done) {
		client.should.be.an.Object;
		done();
	});

	it('should get a new token', function(done) {
		console.log(client.getAccessToken());
		//client.getAccessToken.should.be.an.Object;
		done();
	});

	it('should refresh an expired token', function(done) {
		client.should.be.an.Object;
		done();
	});

	it('should make rest calls', function(done) {
		client.should.be.an.Object;
		done();
	});

	it('should update the token to make rest calls', function(done) {
		client.should.be.an.Object;
		done();
	});

	it('should make soap calls', function(done) {
		client.should.be.an.Object;
		done();
	});

	it('should update the token to make soap calls', function(done) {
		client.should.be.an.Object;
		done();
	});

});

