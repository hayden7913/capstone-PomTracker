const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {Restaurant} = require('../models');
const {app, runServer, closeServer} = require('../server');


chai.use(chaiHttp);


describe('PomTracker API resource', function() {

  before(function() {
    return runServer();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  

}
