const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Projects} = require('../server-files/models');
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

  return arr;
}

const generateTask = () => {
  return {
    taskName: faker.lorem.word(),
    totalTime: Math.floor(Math.random()*20),
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

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Projects API resource', function() {

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
  });


  describe('/projects GET endpoint', function() {

    it('should return all existing projects', function() {

      let res;
      return chai.request(app)
        .get('/projects')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.projects.should.have.length.of.at.least(1);
          return Projects.count();
        })
        .then(function(count) {
          res.body.projects.should.have.length.of(count);
        });
    });

    it('should return projects with right fields', function() {

      let resProject;
      return chai.request(app)
        .get('/projects')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.projects.should.be.a('array');
          res.body.projects.should.have.length.of.at.least(1);

          res.body.projects.forEach(function(project) {
            project.should.be.a('object');
            project.should.include.keys(
              '_id', 'projectName', 'tasks');
          });

          res.body.projects.forEach(function(project) {
            project.tasks.forEach(function(task) {
              task.should.be.a('object');
              task.should.include.keys(
                '_id', 'taskName', 'totalTime', 'log');
            });
          });
          resProject = res.body.projects[0];

          return Projects.findById(resProject._id).exec();
        })
        .then(function(project) {
          resProject.projectName.should.equal(project.projectName);

          resProject.tasks.forEach(function(resTask, index) {
            let task = project.tasks[index];
            resTask.taskName.should.equal(task.taskName);
            resTask.totalTime.should.equal(task.totalTime);

            resTask.log.forEach(function(resEntry, index) {
              let entry = task.log[index];
              resEntry.startTime.should.equal(entry.startTime);
              resEntry.endTime.should.equal(entry.endTime);

            });
          });
        });
    });

    it('should respond with a Not Found error if a request is made to a non-existant endpoint', function() {
      return chai.request(app)
        .get('/notAnEndpoint')
        .catch(function(err){
          err.should.have.status(404);
        })
    });
  });

  describe('/projects POST endpoint', function() {
    it('should add a new project', function() {

      const newProject = generateProject();
      return chai.request(app)
        .post('/projects')
        .send(newProject)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('_id', 'projectName', 'tasks');
          res.body._id.should.not.be.null;
          res.body.projectName.should.equal(newProject.projectName);
          res.body.tasks.should.have.length.of(newProject.tasks.length);
          return Projects.findById(res.body._id);
        })
        .then(function(project) {
          project.projectName.should.equal(newProject.projectName);

          newProject.tasks.forEach(function(newTask, index) {
            let task = project.tasks[index];
            newTask.taskName.should.equal(task.taskName);
            newTask.totalTime.should.equal(task.totalTime);

            newTask.log.forEach(function(newEntry, index) {
              let entry = task.log[index];
              newEntry.startTime.should.equal(entry.startTime);
              newEntry.endTime.should.equal(entry.endTime);
          });
        });
      });
    });

    it('should respond with a Bad Request error if fields are missing', function() {

      const newProject = generateProject();
      delete newProject.projectName;

      return chai.request(app)
        .post('/projects')
        .send(newProject)
        .catch(function(err) {
          err.should.have.status(400);
        })
    });

    it('should respond with a Conflict error if an atempt is made to create a project that already exists', function() {

      let newProject;
       return Projects
        .findOne()
        .exec()
        .then(function(project) {
          newProject = {
            'projectName': project.projectName,
            'tasks': []
          }
          return chai.request(app)
            .post('/projects')
            .send(newProject)
            })
            .then(function(project) {
            })
            .catch(function(err) {
              err.should.have.status(409)
            })
        })
  });

  describe('/projects/:projectId GET endpoint', function() {

    it('should return a single project with corrrect fields', function() {

      let resProject;
      return Projects
        .findOne()
        .exec()
        .then(function(project) {
          resProject = project;

          return chai.request(app)
            .get(`/projects/${resProject.id}`)
            .then(function(res) {
              res.should.have.status(200);
              res.should.be.json;
              res.body.projects.should.be.a('object');
              res.body.projects.should.include.keys('_id', 'projectName', 'tasks');

              res.body.projects.tasks.forEach(function(task) {
                task.should.include.keys('_id', 'taskName', 'totalTime', 'log');
              });
            });
        });
    });

    it('should respond with a Not Found error if a request is made to non-existant endpoint', function() {

      return chai.request(app)
        .get('/notAnEndpoint/45645789')
        .catch(function(err){
          err.should.have.status(404);
        })
    });

  });

  describe('/projects/:projectId PUT endpoint', function() {

    it('should update specified fields', function() {

        const updateData = {
          projectName: 'Updated Project Name'
        }

        return Projects
          .findOne()
          .exec()
          .then(function(project) {
            updateData._id = project._id;
            return chai.request(app)
              .put(`/projects/${project._id}`)
              .send(updateData);
          })
          .then(function(res) {
            res.should.have.status(204);

            return Projects.findById(updateData._id).exec();
          })
          .then(function(projects) {
            projects.projectName.should.equal(updateData.projectName);
          });
        });

        it('should respond with a Bad Request error if fields are missing', function() {
          const updateData = {
            projectNameMisspelled: 'Updated Project Name'
          }
          return Projects
            .findOne()
            .exec()
            .then(function(project) {
              updateData._id = project._id;
              return chai.request(app)
                .put(`/projects/${project._id}`)
                .send(updateData);
            })
            .catch(function(err) {
              err.should.have.status(400);
            })
        });

        it('should respond with a Bad Request error if body id and parameter id don\'t match', function() {

          const updateData = {
            projectName: 'Updated Project Name'
          }

          return Projects
            .findOne()
            .exec()
            .then(function(project) {
              updateData._id = 123456789;
              return chai.request(app)
                .put(`/projects/${project._id}`)
                .send(updateData);
            })
            .catch(function(err) {
              err.should.have.status(400);
            })
        });
  });

  describe('/projects/:projectId DELETE endpoint', function() {

    it('should delete a project by id', function() {

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

    it('should respond with a Not Found error if parameter id is missing or incorrect', function() {

      return chai.request(app)
        .delete('/projects/123456789')
        .catch(function(err){
          err.should.have.status(404);
        })
    });
  });

  describe('/projects/:projectId/tasks GET endpoint', function() {

    it('should get tasks with correct fields from a single project', function() {

      return Projects
        .findOne()
        .exec()
        .then(function(project) {
          const projectId = project.id;
          return chai.request(app)
            .get(`/projects/${projectId}/tasks/`)
            .then(function(res) {
              res.should.have.status(200);
              res.should.be.json;
              res.body.tasks.should.be.a('array');
              res.body.tasks.forEach(function(task) {
                task.should.include.keys('_id', 'taskName', 'totalTime', 'log');
              });
            });
        });
    });

    it('should respond with a Not Found error if a request is made to non-existant endpoint', function() {

      return chai.request(app)
        .get('/notAnEndpoint/1232456/tasks')
        .catch(function(err){
          err.should.have.status(404);
        })
    });
  });

  describe('/projects/:projectId/tasks/:taskId PUT endpoint', function() {

    it('should update specified fields of a task', function() {

        let taskId;
        const updateData = {
          'taskName': 'Updated Task',
          'totalTime': 25,
          'log': []
        }

        return Projects
          .findOne()
          .exec()
          .then(function(project) {
            updateData.id = project.id;
            taskId = project.tasks[0].id;
            return chai.request(app)
              .put(`/projects/${project.id}/tasks/${taskId}`)
              .send(updateData);
          })
          .then(function(res) {
            res.should.have.status(204);

            return Projects.findById(updateData.id).exec();
          })
          .then(function(project) {
            project.tasks[0].taskName.should.equal(updateData.taskName);
          });
        });

        it('should respond with a Bad Request error if fields are missing', function() {

            let taskId;
            const updateData = {
              'taskName': 'Updated Task',
              'log': []
            }

            return Projects
              .findOne()
              .exec()
              .then(function(project) {
                updateData.id = project.id;
                taskId = project.tasks[0].id;
                return chai.request(app)
                  .put(`/projects/${project.id}/tasks/${taskId}`)
                  .send(updateData);
              })
              .catch(function(err) {
                err.should.have.status(400);
              })
        });
    });

      describe('/projects/:projectId/tasks/:taskId PUT endpoint', function() {

        it('should delete a specified task', function() {

            let project, taskId;
            return Projects
              .findOne()
              .exec()
              .then(function(_project) {
                project = _project;
                taskId = project.tasks[0].id;
                return chai.request(app)
                  .delete(`/projects/${project.id}/tasks/${taskId}`);
              })
              .then(function(res) {
                res.should.have.status(204);

                return Projects.findById(project.id);
              })
              .then(function(project) {
                should.not.exist(project.tasks.id(taskId));
                  });
            });

            it('should respond with a Not Found error if parameter id is missing or incorrect', function() {

                let project, taskId;
                return Projects
                  .findOne()
                  .exec()
                  .then(function(_project) {
                    project = _project;
                    taskId = project.tasks[0].id;
                    return chai.request(app)
                      .delete(`/projects/${project.id}/tasks/${taskId}`);
                  })
                  .catch(function(err) {
                    err.should.have.status(404);
                  })
            });
      });
});
