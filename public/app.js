
const state = {
	projects: ["none", "Sample Project"],
	tasks: [],
	errorMessage: {
		duplicateProject: 'That project already exists. Please use a different project name',
		duplicateTask: 'That task already exists. Please use a different task name',
		invalidTime: 'Please enter a time that is greater than 0'
	}
}

Array.prototype.flatten = function() {
  return this.reduce((cv, pv) => cv.concat(pv), []);
}

const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

const findElementById = (array, id) => {
	return array.find(element => element.id === id);
}

const minutesToHours = (min) => {
	return Number((Number(min)/60).toFixed(2));
}

function Task(name, totalTime, log , id) {
	this.name = name;
	this.totalTime = Number(totalTime);
  this.log = log;//log === [] ? this.log = [null] : this.log = log;
  this.id = id;
	this.history = [totalTime];
}

Task.prototype.addTime = function(state, elems, t) {
	this.totalTime += minutesToHours(t);

	if (this.history) {
		 this.history.push(this.totalTime);
	}

	renderTaskList(state,elems);
	renderProjectList(state, elems);
}

Task.prototype.reset = function(state, elems) {
	this.totalTime = 0;

	if(this.history) {
		this.history.push(0);
	}

	renderProjectList(state, elems);
}

Task.prototype.undo = function(state, elems) {

	if (this.history && this.history.length > 1) {
		this.history.pop();
		this.totalTime = this.history[this.history.length - 1];
	}

	renderProjectList(state, elems);
}

function Project(name , tasks, id) {
  this.name = name;
  this.tasks = tasks;
  this.id = id;
}

Project.prototype.calculateTotalProjectTime = function () {

    if (this.tasks.length) {
      return this.tasks
               	 .map(task => task.totalTime)
               	 .reduce((a,b) => a+b);
    } else {
      return 0;
    }
}


const pushNewProject = (state, elems, data) => {

		state.projects.push(new Project(data.projectName, data.tasks, data._id))
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
		renderTaskList(state, elems)

}

const createProject = (state, elems, name) => {
	const newProject = {
			'projectName': name,
			'tasks': []
		};

		$.ajax({
      url: `/projects`,
      type: 'POST',
			data: newProject,
      success: data => pushNewProject(state, elems, data),
			error: err => elems.projectError.text(err.responseText)
    });

}

const setState = (state, elems, data) => {
	  state.projects = data.projects.map(project => {
	    const tasks = project.tasks.map(task => new Task (task.taskName, task.totalTime, task.log, task._id));
	    return new Project(project.projectName, tasks, project._id);
	  });
		//state.projects should always contain a project called "none"
		const indexOfNone = state.projects.findIndex(project => project.name === "none");

		if (indexOfNone === -1) {
			createProject(state, elems, "none");
		}

    renderProjectOptions(state, elems);
  	renderProjectList(state, elems);
  	renderTaskList(state, elems);
}

const getProjects = (state, elems, callback) => {
	$.getJSON("/projects", data => callback(state, elems, data) );
}


const pushNewTask = (state, elems, parentProjectId, data) => {
	const projectIndex = state.projects.findIndex(project => project.id === parentProjectId );
	const newTask = data.projects.tasks.pop();
	state.projects[projectIndex].tasks.push(new Task(newTask.taskName, 0 , newTask.log, newTask._id))
	renderTaskList(state, elems)
}

const getProjectById = (state, elems, projectId, callback) => {
	$.getJSON(`/projects/${projectId}`, data => callback(data));
}

const createTask = (state, elems, name, parentProjectId) => {

	const newTask = {
			'taskName': name,
			'totalTime': 0,
			'log': []
		};

		const testFunc = pushNewTask.bind(null, state, elems, parentProjectId);

		$.ajax({
      url: `/projects/${parentProjectId}`,
      type: 'POST',
			data: newTask,
      success: () => getProjectById(state, elems, parentProjectId, testFunc),
			error: err => elems.taskError.text(err.responseText)
    });
}

const updateTask = (state, elems, task, projectId) => {
	const updatedTask = {
    'taskName': task.name,
    'totalTime': task.totalTime,
    'log': task.log,
		'_id': task.id
  }

    $.ajax({
      url: `/projects/${projectId}/tasks/${task.id}`,
      type: 'PUT',
      data: updatedTask
    });
}

const deleteProject = (state, elems, _project) => {

  const confirmMessage = `Are you sure you want to delete \"${_project.name}\" and all of it's tasks?`;
  const onConfirm = (result) => {

    if (result) {
      const projectIndex = state.projects.findIndex(project => project.id === _project.id );

      state.projects.splice(projectIndex, 1);

			$.ajax({
					url: `/projects/${_project.id}`,
					type: 'DELETE'
			});

      renderProjectList(state, elems);
      renderProjectOptions(state, elems);
      renderTaskList(state, elems);
    }
  }

  bootbox.confirm(confirmMessage, onConfirm);
}

const deleteTask = (state, elems, _task, _project) => {

  const confirmMessage = `Are you sure you want to delete \"${_task.name}\"`;
  const onConfirm = (result) => {

    if (result) {
      const projectIndex = state.projects.findIndex(project => project.id === _project.id );
      const taskIndex = state.projects[projectIndex].tasks.findIndex(task => task.id === _task.id);

      state.projects[projectIndex].tasks.splice(taskIndex, 1);

			$.ajax({
					url: `/projects/${_project.id}/tasks/${_task.id}`,
					type: 'DELETE',
					success: ( ) => console.log('Deleted')
			});

			renderProjectOptions(state, elems);
      renderProjectList(state, elems);
      renderTaskList(state, elems);
    }
  }

  bootbox.confirm(confirmMessage, onConfirm);
}


const renderTask = (state, elems, task, project) => {

 const projectName = project.name === "none" ? "" : project.name;
 let template = $(
	`<div id="wrapper">
		<div class="timeMod well">
				<div class="topRow">
					<span class="title">${task.name}</span>
					<span class="acctotal">${task.totalTime.toFixed(2)}</span>
					<span class="project">${projectName}<span>
				</div>
			<div class="btn-group timeButtons">
				<button type="button" class="js-btn5 btn btn-primary">5</button>
				<button type="button" class="js-btn15 btn btn-primary">15</button>
				<button type="button" class="js-btn25 btn btn-primary" value="25">25</button>
				<input type="text" name="" id="customInput${task.id}" class="customInput form-control">
				<span id="invalidTimeError"></span>

			</div>
			<div class="controlButtons">
				<button type="button" id="js-reset" class="btn btn-primary" >Reset</button>
				<button type="button" id="js-undo" class="btn btn-primary" >Undo</button>
				<button type="button" id="js-delete" class="btn btn-primary" >Delete</button>
			</div>
		</div>
	</div>`)


 	template.find(".js-btn5").click( () => {
 		task.addTime(state, elems, 5);
		updateTask(state, elems, task, project.id);
 	});

 	template.find(".js-btn15").click( () => {
		task.addTime(state, elems, 15);
		updateTask(state, elems, task, project.id);


 	});
 	template.find(".js-btn25").click( () => {
 		task.addTime(state, elems, 25);
		updateTask(state, elems, task, project.id);


 	});

 	template.find("#js-reset").click( () => {
 		task.reset(state, elems);
		updateTask(state, elems, task, project.id);

 	});

 	template.find(`#customInput${task.id}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${task.id}`).val());
 			task.addTime(state, elems, input);
			updateTask(state, elems, task, project.id);
			renderProjectList(state, elems);
 			renderTaskList(state, elems);
 			//updateAllTasks(state);
 			//this.reset;
 		}
 	})

 	template.find("#js-undo").click( () => {
 		task.undo(state, elems);
		updateTask(state, elems, task, project.id);
		renderProjectList(state, elems);
 		renderTaskList(state, elems);
 	})

 	template.find("#js-delete").click( () => {
		deleteTask(state, elems, task, project)
 	});

 	template.find(".btn").click(() => {
 		renderTaskList(state, elems);
 	});

 	return template;
}

const renderTaskList = (state, elems) => {
	let resHtml =
    state.projects.map(project =>
			project.tasks.map(task =>
				renderTask(state, elems, task, project)));

	elems.taskList.html(flatten(resHtml).reverse());
}

const renderProjectOptions = (state, elems) => {
	let projectNoneId;
	resHtml = state.projects
		.map((project) => {
			if (project.name === "none") {
				projectNoneId = project.id;
			} else {
				return `<option value="${project.id}">${project.name}</option>`;
			}
		});

	resHtml.unshift(`<option value="${projectNoneId}">none</option>`)
	elems.projectSelect.html(resHtml);
}

const renderOneProject = (state, elems, project) => {
	const resHtml = $(
		`<div>
			<div id="projectWrapper">
				<span class="project">${project.name}</span>
				<span class="projectValue">${project.calculateTotalProjectTime().toFixed(2)}</span>
				<button id="deleteProject" class="btn btn-outline-secondary">X</button>
			</div>
		</div>`
	);

	resHtml.find("#deleteProject").click(() => {
		deleteProject(state, elems, project);
	});
	return resHtml;
}

const renderProjectList = (state, elems) => {

  const resHtml =
    state.projects
				 .map(project => {
						if (project.name != "none") {
							return renderOneProject(state, elems, project);
						}
				 });

	$("#projects").html(resHtml);
}




const alreadyExists = (array, name) => {
	const index = array.findIndex(element => element === name);
	if (index === -1) {
		return false;
	} else {
		return true;
	}
}


const initProjectSubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();

		const name = elems.projectName.val();

		elems.projectError.text("");
		createProject(state, elems, name);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
		elems.projectName.val("");
	});
}

const initTaskSubmitHandler = (state, elems) => {
	$(elems.newTask).on("submit", (e) => {
		e.preventDefault();

		const name = elems.taskName.val();
		const parentProjectId = $("#selectProject").val();
		const taskProject = parentProjectId === "none" ? undefined : parentProjectId;
		const parentProject = findElementById(state.projects, parentProjectId);

		elems.taskError.text("");
		createTask(state, elems, name, parentProjectId);
		elems.taskName.val("");

	});
}


const main = () => {

	const elems = {
		newProject: $("#newProject"),
		projectSelect: $("#selectProject"),
		newTask : $("#newTask"),
		taskList: $("#taskList"),
		projectName: $("#projectName"),
		taskName:$("#taskName"),
		projectError: $("#duplicateProjectError"),
		taskError: $("#duplicateTaskError")
	};

  getProjects(state, elems, setState);
	initProjectSubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);

}

$(main);
