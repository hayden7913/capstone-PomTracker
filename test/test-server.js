const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {Projects} = require('../models');
const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

const generateProjectName = () => {
  const parents = ["Node Capstone", "React Tutorial", "Remodel Kitchen"];
  return parents[Math.floor(Math.random() * parents.length)];
}

const generateTime = () => {
  const hours = Math.floor(Math.random() * 24);
  let minutes = Math.floor(Math.random() * 60);
  if (minutes.toString().length === 1) {
    minutes = `0${minutes}`
  }
  return `${hours}:${minutes}`
}

const generateTaskLogEntry = () => {
  return {
    startTime: generateTime(),
    endTime: generateTime()
  }
}

const generateDataArray = (callback, maxLength) => {
  let arr = [];
  for (let i = 0; i < Math.random() * maxLength + 1; i++) {
    arr.push(callback())
  }
  return arr
}

const generateTask = () => {
  return {
    taskName: faker.lorem.word(),
    total: Math.floor(Math.random()*20),
    log: generateDataArray(generateTaskLogEntry, 3)

  }
}

const generateProject = () => {
  return {
    projectName: faker.lorem.word(),
    tasks: generateDataArray(generateTask, 3),
  }
}

const seedProjectData = () => {
  const seedData = generateDataArray(generateProject, 2);
  return Projects.insertMany(seedData);
}



// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
/*function seedProjectsData() {
  console.info('seeding blog post data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateProjectsData());
  }
  // this will return a promise
  return Projects.insertMany(seedData);
}

// used to generate data to put in db
function generateBoroughName() {
  const boroughs = [
    'Manhattan', 'Queens', 'Brooklyn', 'Bronx', 'Staten Island'];
  return boroughs[Math.floor(Math.random() * boroughs.length)];
}

// used to generate data to put in db
function gnerateCuisineType() {
  const cuisines = ['Italian', 'Thai', 'Colombian'];
  return cuisines[Math.floor(Math.random() * cuisines.length)];
}

// used to generate data to put in db
function generateGrade() {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  return {
    date: faker.date.past(),
    grade: grade
  }
}

// generate an object represnting a Projects.
// can be used to generate seed data for db
// or request.body data
function generateProjectsData() {
  return {
    name: faker.company.companyName(),
    borough: generateBoroughName(),
    cuisine: gnerateCuisineType(),
    address: {
      building: faker.address.streetAddress(),
      street: faker.address.streetName(),
      zipcode: faker.address.zipCode()
    },
    grades: [generateGrade(), generateGrade(), generateGrade()]
  }
}*/


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
//
// we have this function return a promise because
// mongoose operations are asynchronous. we can either
// call a `done` callback or return a promise in our
// `before`, `beforeEach` etc. functions.
// https://mochajs.org/#asynchronous-hooks
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Projects API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedProjectsData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer();
  });

  beforeEach(function() {
    return seedProjectData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing projects', function() {
      // strategy:
      //    1. get back all Projectss returned by by GET request to `/Projectss`
      //    2. prove res has right status, data type
      //    3. prove the number of Projectss we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/projects')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.projects.should.have.length.of.at.least(1);
          return Projects.count();
        })
        .then(function(count) {
          res.body.projects.should.have.length.of(count);
        });
    });


    /*it('should return Projectss with right fields', function() {
      // Strategy: Get back all Projectss, and ensure they have expected keys

      let resProjects;
      return chai.request(app)
        .get('/Projectss')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.Projectss.should.be.a('array');
          res.body.Projectss.should.have.length.of.at.least(1);

          res.body.Projectss.forEach(function(Projects) {
            Projects.should.be.a('object');
            Projects.should.include.keys(
              'id', 'name', 'cuisine', 'borough', 'grade', 'address');
          });
          resProjects = res.body.Projectss[0];
          return Projects.findById(resProjects.id);
        })
        .then(function(Projects) {

          resProjects.id.should.equal(Projects.id);
          resProjects.name.should.equal(Projects.name);
          resProjects.cuisine.should.equal(Projects.cuisine);
          resProjects.borough.should.equal(Projects.borough);
          resProjects.address.should.contain(Projects.address.building);

          resProjects.grade.should.equal(Projects.grade);
        });
    });*/
  });

  describe('POST endpoint', function() {

    it('should add a new project', function() {

      const newProject = generateProject();
      return chai.request(app)
        .post('/projects')
        .send(newProject)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            '_id', 'projectName', 'tasks');
          res.body._id.should.not.be.null;
          res.body.projectName.should.equal(newProject.projectName);
          res.body.tasks.should.have.length.of(newProject.tasks.length);
          return Projects.findById(res.body._id);
        })
        .then(function(project) {
          project.projectName.should.equal(newProject.projectName);
          project.tasks.should.have.length.of(newProject.tasks.length);
        });
    });
  });

  describe('PUT endpoint', function() {

  it('should update fields you send over', function() {
      const updateData = {
        projectName: 'Updated Project Name'
      }
      return Projects
        .findOne()
        .exec()
        .then(function(projects) {
          updateData.id = projects.id;

          return chai.request(app)
            .put(`/projects/${projects.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);

          return Projects.findById(updateData.id).exec();
        })
        .then(function(projects) {
          projects.projectName.should.equal(updateData.projectName);
        });
      });
    });

  describe('DELETE endpoint', function() {

    it('Delete a project by id', function() {

      let project;

      return Projects
        .findOne()
        .exec()
        .then(function(_project) {

          project = _project;
          return chai.request(app).delete(`/projects/${project.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Projects.findById(project.id);
        })
        .then(function(_project) {
          should.not.exist(_project);
        });
    });
  });
});
