/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _modal = __webpack_require__(1);
	
	console.log('hola');
	
	var state = {
	  projects: [],
	  tasks: [],
	  focusedFormId: null,
	  errorMessage: {
	    duplicateProject: 'That project already exists. Please use a different project name',
	    emptyProject: 'Please enter a valid project name',
	    duplicateTask: 'That task already exists. Please use a different task name',
	    emptyTask: 'Please enter a valid task name',
	    customInputNan: 'Please enter a valid number in minutes'
	  }
	};
	
	var minutesToHours = function minutesToHours(min) {
	  var hours = Math.floor(min / 60);
	  var minutes = Math.round(min % 60);
	
	  return hours + 'hr ' + minutes + 'm';
	};
	
	function Task(name, totalTime, log, id) {
	  this.name = name;
	  this.totalTime = Number(totalTime);
	  this.log = log;
	  this.id = id;
	  this.history = [totalTime];
	}
	
	Task.prototype.addTime = function (state, elems, t) {
	  if (this.totalTime + t < 0) {
	    this.totalTime = 0;
	  } else {
	    this.totalTime += t;
	    this.history.push(this.totalTime);
	
	    renderProjectList(state, elems);
	  }
	};
	
	Task.prototype.reset = function (state, elems) {
	  this.totalTime = 0;
	  this.history.push(0);
	
	  renderProjectList(state, elems);
	};
	
	Task.prototype.undo = function (state, elems) {
	  if (this.history.length > 1) {
	    this.history.pop();
	    this.totalTime = this.history[this.history.length - 1];
	  }
	
	  renderProjectList(state, elems);
	};
	
	function Project(name, position, tasks, id) {
	  this.name = name;
	  this.position = position;
	  this.tasks = tasks;
	  this.id = id;
	}
	
	Project.prototype.calculateTotalProjectTime = function () {
	  return this.tasks.length ? this.tasks.map(function (task) {
	    return task.totalTime;
	  }).reduce(function (a, b) {
	    return a + b;
	  }) : 0;
	};
	
	var pushNewProject = function pushNewProject(state, elems, data) {
	  state.projects.push(new Project(data.projectName, data.position, data.tasks, data._id));
	  renderProjectList(state, elems);
	};
	
	var createProject = function createProject(state, elems, name) {
	  var newProject = {
	    'projectName': name,
	    'position': state.projects.length,
	    'tasks': []
	  };
	
	  $.ajax({
	    url: '/projects',
	    type: 'POST',
	    data: newProject,
	    success: function success(data) {
	      return pushNewProject(state, elems, data);
	    },
	    error: function error(err) {
	      if (err.status === 409) {
	        elems.projectError.text(err.responseText);
	      }
	    }
	  });
	};
	
	var setState = function setState(state, elems, data) {
	  state.projects = data.projects.map(function (project) {
	    var tasks = project.tasks.map(function (task) {
	      return new Task(task.taskName, task.totalTime, task.log, task._id);
	    });
	    return new Project(project.projectName, project.position, tasks, project._id);
	  });
	
	  renderProjectList(state, elems);
	};
	
	var getProjects = function getProjects(state, elems, callback) {
	  $.getJSON("/projects", function (data) {
	    return callback(state, elems, data);
	  });
	};
	
	var findIndexById = function findIndexById(array, id) {
	  return array.findIndex(function (element) {
	    return element.id === id;
	  });
	};
	
	var pushNewTask = function pushNewTask(state, elems, parentProjectId, task) {
	  var projectIndex = findIndexById(state.projects, parentProjectId);
	
	  state.projects[projectIndex].tasks.push(new Task(task.taskName, 0, task.log, task._id));
	  renderProjectList(state, elems);
	  elems.projectList.find('#' + state.focusedFormId).find("input").focus();
	};
	
	var createTask = function createTask(state, elems, name, parentProjectId) {
	  var newTask = {
	    'taskName': name,
	    'totalTime': 0,
	    'log': []
	  };
	
	  $.ajax({
	    url: '/projects/' + parentProjectId,
	    type: 'POST',
	    data: newTask,
	    success: function success(data) {
	      return pushNewTask(state, elems, parentProjectId, data);
	    },
	    error: function error(err) {
	      if (err.status === 409) {
	        elems.projectList.find('#task-error-' + parentProjectId).text(err.responseText);
	      }
	    }
	  });
	};
	
	var updateTask = function updateTask(state, elems, task, projectId) {
	  var updatedTask = {
	    'taskName': task.name,
	    'totalTime': task.totalTime,
	    'log': task.log,
	    '_id': task.id
	  };
	
	  $.ajax({
	    url: '/projects/' + projectId + '/tasks/' + task.id,
	    type: 'PUT',
	    data: updatedTask
	  });
	};
	
	var deleteProject = function deleteProject(state, elems, _project) {
	  var confirmMessage = 'Are you sure you want to delete "' + _project.name + '" and all of it\'s tasks?';
	  var onConfirm = function onConfirm(result) {
	    if (result) {
	      var projectIndex = findIndexById(state.projects, _project.id);
	
	      $.ajax({
	        url: '/projects/' + _project.id,
	        type: 'DELETE',
	        success: function success(data) {
	          state.projects.splice(projectIndex, 1);
	          renderProjectList(state, elems);
	        }
	      });
	    }
	  };
	
	  (0, _modal.myConfirm)(confirmMessage, "button", onConfirm);
	};
	
	var deleteTask = function deleteTask(state, elems, _task, _project) {
	  var confirmMessage = 'Are you sure you want to delete "' + _task.name + '"?';
	  var onConfirm = function onConfirm(result) {
	    if (result) {
	      var projectIndex = findIndexById(state.projects, _project.id);
	      var taskIndex = state.projects[projectIndex].tasks.findIndex(function (task) {
	        return task.id === _task.id;
	      });
	
	      state.projects[projectIndex].tasks.splice(taskIndex, 1);
	
	      $.ajax({
	        url: '/projects/' + _project.id + '/tasks/' + _task.id,
	        type: 'DELETE'
	      });
	
	      renderProjectList(state, elems);
	    }
	  };
	  (0, _modal.myConfirm)(confirmMessage, "button", onConfirm);
	};
	
	var renderTask = function renderTask(state, elems, task, project) {
	  var projectName = project.name;
	  var template = $('<div class="time-mod-wrapper">\n    <div class="time-mod well">\n      <div class="top-row">\n        <div class="task-name name">' + task.name + '</div>\n        <span class="total-task-time">' + minutesToHours(task.totalTime) + '</span>\n      </div>\n    <div class="time-controls">\n      <div class="button-group">\n        <button type="button" class="js-btn5 button button-group button-left">+5m</button>\n        <button type="button" class="js-btn15 button button-group">+15m</button>\n        <button type="button" class="js-btn25 button button-group button-right" value="25">+25m</button>\n      </div>\n      <form id="custom-input-form-' + task.id + '" class="custom-input-form">\n        <input id="custom-input-' + task.id + '" type="text" class="custom-input" placeholder="+m" >\n        <button class="custom-input-submit-button" type="submit">\n          <i class="fa fa-plus custom-input-submit-icon" aria-hidden="true"></i>\n        </button>\n      </form>\n    </div>\n        <span id="invalid-time-error-' + task.id + '" class="error"></span>\n      <div class="control-buttons">\n        <button type="button" class="js-reset button" >Reset</button>\n        <button type="button" class="js-undo button" >Undo</button>\n        <button type="button" class="js-delete button" >Delete</button>\n      </div>\n    </div>\n  </div>');
	
	  template.find(".js-btn5").click(function () {
	    task.addTime(state, elems, 5);
	  });
	
	  template.find(".js-btn15").click(function () {
	    task.addTime(state, elems, 15);
	  });
	
	  template.find(".js-btn25").click(function () {
	    task.addTime(state, elems, 25);
	  });
	
	  template.find(".js-reset").click(function () {
	    task.reset(state, elems);
	  });
	
	  template.find(".js-undo").click(function () {
	    task.undo(state, elems);
	  });
	
	  template.find(".js-delete").click(function () {
	    deleteTask(state, elems, task, project);
	  });
	
	  template.find(".button").click(function () {
	    updateTask(state, elems, task, project.id);
	    renderProjectList(state, elems);
	  });
	
	  template.find('#custom-input-form-' + task.id).on("submit", function (e) {
	    e.preventDefault();
	    var input = Number($('#custom-input-' + task.id).val());
	
	    if (isNaN(input)) {
	      $('#invalid-time-error-' + task.id).text(state.errorMessage.customInputNan);
	    } else {
	      task.addTime(state, elems, input);
	      undefined.reset;
	      updateTask(state, elems, task, project.id);
	      renderProjectList(state, elems);
	    }
	  });
	
	  return template;
	};
	
	var renderTaskList = function renderTaskList(state, elems, project) {
	  var taskListHtml = project.tasks.map(function (task) {
	    return renderTask(state, elems, task, project);
	  });
	
	  return taskListHtml.reverse();
	};
	
	var renderProject = function renderProject(state, elems, project) {
	  var taskListHtml = renderTaskList(state, elems, project);
	  var taskFormId = 'js-task-form-' + project.id;
	  var taskErrorId = 'task-error-' + project.id;
	  var taskListWrapperHtml = $('<div id="js-task-list-wrapper" class="task-list-wrapper"></div>');
	  var projectTemplate = $('<div id="js-project-wrapper" class="project-wrapper well" >\n    <span class="js-delete-project-button delete-project-button">&times</span>\n    <div class="project-header">\n      <div class="project-name">' + project.name + '</div>\n      <div class="total-project-time">' + minutesToHours(project.calculateTotalProjectTime()) + '</div>\n    </div>\n    <div class="js-add-new-task add-new-task ">Add new task..</div>\n    <form id=' + taskFormId + ' class="new-task-form ' + (taskFormId === state.focusedFormId ? "" : "hide") + '">\n      <div class="no-wrap-input-submit">\n        <input  class="new-task-input name-input" placeholder="Enter Task Name" type="text"></input>\n          <button class="task-submit-button submit-button">\n            <i class="fa fa-plus " aria-hidden="true"></i>\n          </button>\n      </div>\n    </form>\n    <div id=' + taskErrorId + ' class="error task-error"></div>\n  </div>');
	
	  taskListWrapperHtml.html(renderTaskList(state, elems, project));
	  projectTemplate.append(taskListWrapperHtml);
	  projectTemplate = $('<div class="col3"><div>').append(projectTemplate);
	
	  projectTemplate.find(".js-add-new-task").click(function (e) {
	    e.stopPropagation();
	    elems.projectList.find('.new-task-form').addClass("hide");
	    elems.projectList.find('#' + taskFormId).removeClass("hide").find("input").focus();
	    state.focusedFormId = '' + taskFormId;
	  });
	
	  projectTemplate.find('#' + taskFormId).on("submit", function (e) {
	    e.preventDefault();
	    var name = $(this).find("input").val();
	
	    if (!(name == null || name.trim() === '')) {
	      elems.taskError.text("");
	      createTask(state, elems, name, project.id);
	      $('#' + taskFormId).val("");
	    } else {
	      elems.projectList.find('#' + taskFormId).find("input").focus();
	      elems.projectList.find('#task-error-' + project.id).text(state.errorMessage.emptyTask);
	    }
	  });
	
	  projectTemplate.find(".js-delete-project-button").click(function () {
	    deleteProject(state, elems, project);
	  });
	
	  return projectTemplate;
	};
	
	var renderProjectList = function renderProjectList(state, elems) {
	  var projectListHtml = state.projects.map(function (project) {
	    return renderProject(state, elems, project);
	  }).sort(function (a, b) {
	    return a.position - b.position;
	  }).reverse();
	
	  elems.projectList.html(projectListHtml);
	};
	
	var initProjectSubmitHandler = function initProjectSubmitHandler(state, elems) {
	  $(elems.newProject).on("submit", function (e) {
	    e.preventDefault();
	    var name = elems.projectInput.val();
	
	    if (!(name == null || name.trim() === '')) {
	      elems.projectError.text("");
	      createProject(state, elems, name);
	      elems.projectInput.val("");
	    } else {
	      elems.projectInput.focus();
	      elems.projectError.text(state.errorMessage.emptyProject);
	    }
	  });
	};
	
	var initbodyClickHandler = function initbodyClickHandler(state, elems) {
	  $("body").on("click", function (e) {
	    e.stopPropagation();
	    elems.projectList.find(".error").text("");
	    elems.projectError.text("");
	
	    if (!$(e.target).hasClass("new-task-input") && !$(e.target).hasClass('task-submit-button') && !$(e.target).hasClass('fa-plus')) {
	      elems.projectList.find(".new-task-form").addClass("hide");
	      state.focusedFormId = null;
	    }
	  });
	};
	
	var main = function main() {
	  var elems = {
	    newProject: $("#new-project-form"),
	    projectList: $("#project-list"),
	    projectInput: $("#new-project-input"),
	    projectError: $("#project-error"),
	    taskError: $("#task-error"),
	    timeInputError: $("#invalid-time-error")
	  };
	
	  getProjects(state, elems, setState);
	  initProjectSubmitHandler(state, elems);
	  initbodyClickHandler(state, elems);
	};
	
	$(main);
	;
	
	var _temp = function () {
	  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	    return;
	  }
	
	  __REACT_HOT_LOADER__.register(Task, 'Task', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(Project, 'Project', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(state, 'state', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(minutesToHours, 'minutesToHours', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(pushNewProject, 'pushNewProject', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(createProject, 'createProject', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(setState, 'setState', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(getProjects, 'getProjects', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(findIndexById, 'findIndexById', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(pushNewTask, 'pushNewTask', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(createTask, 'createTask', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(updateTask, 'updateTask', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(deleteProject, 'deleteProject', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(deleteTask, 'deleteTask', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(renderTask, 'renderTask', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(renderTaskList, 'renderTaskList', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(renderProject, 'renderProject', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(renderProjectList, 'renderProjectList', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(initProjectSubmitHandler, 'initProjectSubmitHandler', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(initbodyClickHandler, 'initbodyClickHandler', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	
	  __REACT_HOT_LOADER__.register(main, 'main', '/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/app.js');
	}();

	;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var myConfirm = exports.myConfirm = function myConfirm(message, okButtonClass, callback) {
	  var template = $("\n    <div id=\"myModal\" class=\"modal-body\">\n      <div class=\"modal-content\">\n         <span id=\"modal-close\">&times;</span>\n          <div id=\"modal-message\">" + message + "</div>\n          <div id=\"button-wrapper\">\n            <button id=\"btn-cancel\" class=\"modal-btn\">Cancel</button>\n            <button id=\"btn-ok\" class=\"" + okButtonClass + " modal-btn\">Okay</button>\n          </div>\n      </div>\n    </div>");
	
	  template.find("#btn-cancel").click(function () {
	    callback(false);
	    $("#myModal").remove();
	  });
	
	  template.find("#btn-ok").click(function () {
	    callback(true);
	    $("#myModal").remove();
	  });
	
	  $("body").on('keyup', function (event) {
	
	    if (event.keyCode == 13) {
	      callback(true);
	      $("#myModal").remove();
	      $("body").off();
	    }
	  });
	
	  template.find("#modal-close").click(function () {
	    $("#myModal").remove();
	  });
	
	  $("body").append(template);
	};
	;
	
	var _temp = function () {
	  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
	    return;
	  }
	
	  __REACT_HOT_LOADER__.register(myConfirm, "myConfirm", "/home/hayden/Dropbox/tf/capstone-PomTracker/public/scripts/modal.js");
	}();

	;

/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map