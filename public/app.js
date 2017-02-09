
const state = {
	projects: ["none", "Sample Project"],
	tasks: [],
	taskInputHidden: true,
	focusedInputId: null,
	errorMessage: {
		duplicateProject: 'That project already exists. Please use a different project name',
		duplicateTask: 'That task already exists. Please use a different task name'
	}
}

const minutesToHours = (min) => {
  const hours = Math.floor(min/60);
  const minutes = Math.round(min % 60)

  return `${hours}hr ${minutes}m`
}

function Task(name, totalTime, log , id) {
	this.name = name;
	this.totalTime = Number(totalTime);
  this.log = log;
  this.id = id;
	this.history = [totalTime];
}

Task.prototype.addTime = function(state, elems, t) {

	if (this.totalTime + t < 0)  {
		this.totalTime = 0;
	} else {
		this.totalTime += t;

		if (this.history) {
			 this.history.push(this.totalTime);
		}

		renderProjectList(state, elems);
	}

}

Task.prototype.reset = function(state, elems) {
	this.totalTime = 0;

		this.history.push(0)

	renderProjectList(state, elems);
}

Task.prototype.undo = function(state, elems) {

	if (this.history.length > 1) {
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
	return this.tasks.length ? this.tasks.map(task => task.totalTime).reduce((a,b) => a+b) : 0;
}

const pushNewProject = (state, elems, data) => {
		state.projects.push(new Project(data.projectName, data.tasks, data._id))
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
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
}

const getProjects = (state, elems, callback) => {
	$.getJSON("/projects", data => callback(state, elems, data) );
}

const findIndexById = (array, id) => {
	return array.findIndex(element => element.id === id);
}

const pushNewTask = (state, elems, parentProjectId, data) => {
	const projectIndex = findIndexById(state.projects, parentProjectId);
	const newTask = data.projects.tasks.pop();
	state.projects[projectIndex].tasks.push(new Task(newTask.taskName, 0 , newTask.log, newTask._id))
	renderProjectList(state, elems);
	console.log('hello');
	$("#project-list").find(state.taskInputId).focus();
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

		$.ajax({
      url: `/projects/${parentProjectId}`,
      type: 'POST',
			data: newTask,
      success: () => getProjectById(state, elems, parentProjectId, pushNewTask.bind(null, state, elems, parentProjectId)),
			error: err => $("#project-list").find(elems.taskError).text(err.responseText)
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
      const projectIndex = findIndexById(state.projects, _project.id);

      state.projects.splice(projectIndex, 1);

			$.ajax({
					url: `/projects/${_project.id}`,
					type: 'DELETE'
			});

      renderProjectList(state, elems);
      renderProjectOptions(state, elems);
    }
  }

  bootbox.confirm(confirmMessage, onConfirm);
}

const deleteTask = (state, elems, _task, _project) => {

  const confirmMessage = `Are you sure you want to delete \"${_task.name}\"`;
  const onConfirm = (result) => {

    if (result) {
      const projectIndex = findIndexById(state.projects, _project.id);
      const taskIndex = state.projects[projectIndex].tasks.findIndex(task => task.id === _task.id);

      state.projects[projectIndex].tasks.splice(taskIndex, 1);

			$.ajax({
					url: `/projects/${_project.id}/tasks/${_task.id}`,
					type: 'DELETE',
					success: ( ) => console.log('Deleted')
			});

			renderProjectOptions(state, elems);
      renderProjectList(state, elems);
    }
  }

  bootbox.confirm(confirmMessage, onConfirm);
}


const renderTask = (state, elems, task, project) => {

	//console.log(task, project);

	const projectName = project.name /*=== "none" ? "" : project.name;*/
	const template = $(
		`<div id="wrapper">
			<div class="timeMod well">
					<div class="topRow">
						<span class="title">${task.name}</span>
						<span class="acctotal">${minutesToHours(task.totalTime)}</span>
					</div>
				<div class="button-group timeButtons">
					<button type="button" class="js-btn5 button button-group button-left">+5m</button>
					<button type="button" class="js-btn15 button button-group">+15m</button>
					<button type="button" class="js-btn25 button button-group button-right" value="25">+25m</button>
					<input type="text" name="" id="customInput${task.id}" placeholder="+..m" class="customInput form-control">
					<span id="invalidTimeError"></span>

				</div>
				<div class="controlButtons">
					<button type="button" id="js-reset" class="button" >Reset</button>
					<button type="button" id="js-undo" class="button" >Undo</button>
					<button type="button" id="js-delete" class="button" >Delete</button>
				</div>
			</div>
		</div>`);


 	template.find(".js-btn5").click( () => {
		console.log("hello");
 		task.addTime(state, elems, 5);
 	});

 	template.find(".js-btn15").click( () => {
		task.addTime(state, elems, 15);

 	});

 	template.find(".js-btn25").click( () => {
 		task.addTime(state, elems, 25);
 	});

 	template.find("#js-reset").click( () => {
 		task.reset(state, elems);
 	});

	template.find("#js-undo").click( () => {
		task.undo(state, elems);
	});

	template.find("#js-delete").click( () => {
		deleteTask(state, elems, task, project)
	});

	template.find(".btn").click(() => {
		updateTask(state, elems, task, project.id);
		renderProjectList(state, elems);
	});

 	template.find(`#customInput${task.id}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${task.id}`).val());
 			task.addTime(state, elems, input);
			this.reset;
			updateTask(state, elems, task, project.id);
			renderProjectList(state, elems);
 		}
 	});
	elems.projectList.html(template);

 	return template;
}

const renderTaskList = (state, elems, project) => {
/*	let test
	console.log(project);
	if(project)
	test = renderTask(state, elems, project.tasks[0], project);
	elems.projectList.html(test);*/
	let taskListHtml;
	/*if (project.tasks.length >1) {
	 console.log(project.name);*/
		taskListHtml = project.tasks.map(task => renderTask(state, elems, task, project));
	return taskListHtml.reverse();
/*}*/
}



const renderProject = (state, elems, project) => {

	const taskListHtml = renderTaskList(state, elems, project);
	const taskListWrapperHtml = $(`<div id="js-task-list-wrapper" class="task-list-wrapper"></div>`)
	const taskInputId =`js-task-input-${project.id}`
	const projectContainerTemplate = $(
		`<div id="js-project-wrapper" class="project-wrapper well" >
				<div class="project-header">
					<span class="project-name">${project.name}</span>
					<span class="total-project-time">${minutesToHours(project.calculateTotalProjectTime())}</span>
					<span id="js-remove" class="glyphicon glyphicon-remove"></span>
				</div>
				<div id="js-add-new-task" class="add-new-task ">Add new task..</div>
				<form id="js-new-task-form" class="js-new-task-form">
					<input id=${taskInputId} class="new-task-input ${state.taskInputHidden ? "hide" : ""}" type="text"></input>
				</form>
				<div id="duplicate-task-error" class="error"></div>
		</div>`);

		projectContainerTemplate.find("#js-add-new-task").click( (e) => {
			e.stopPropagation();
			console.log(taskInputId);
			projectContainerTemplate.find(`#${taskInputId}`).removeClass("hide");
			state.taskInputHidden = false;
		});

		projectContainerTemplate.find(".js-new-task-form").on("submit", function(e) {
			e.preventDefault();

			const name = $(this).find("input").val();
			elems.taskError.text("");
			createTask(state, elems, name, project.id);
			$(`#${taskInputId}`).val("");
			state.taskInputId = `#${taskInputId}`;

		});

		projectContainerTemplate.find("#js-remove").click(() =>{
				deleteProject(state, elems, project);
		})

		projectContainerTemplate.append(taskListWrapperHtml.html(taskListHtml));

		return projectContainerTemplate;
}

const renderProjectList = (state, elems) => {
	const projectListHtml = state.projects.map(project => renderProject(state, elems, project));
	elems.projectList.html(projectListHtml);
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

/*const renderOneProject = (state, elems, project) => {
	const resHtml = $(
		`<div>
			<div id="js-project-wrapper" class="well">
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
*/
/*
const renderProjectList = (state, elems) => {
  const resHtml =
    state.projects.map(project => {
						if (project.name != "none") {
							return renderOneProject(state, elems, project);
						}
				 });

	$("#projectList").html(resHtml);
}*/

const initProjectSubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();

		const name = elems.projectInput.val();

		elems.projectError.text("");
		createProject(state, elems, name);
		renderProjectList(state, elems);
		elems.projectInput.val("");
	});
}




const initTaskSubmitHandler = (state, elems) => {
	$(elems.newTask).on("submit", (e) => {
		e.preventDefault();

		const name = elems.taskName.val();
		const parentProjectId = $("#selectProject").val();

		elems.taskError.text("");
		createTask(state, elems, name, parentProjectId);
		elems.taskName.val("");

	});
}

const initbodyClickHandler = (state, elems) => {
	$("body").on("click", (e) => {


		if (!$(e.target).hasClass('new-task-input')) {

		}

	})
}


const main = () => {

	const elems = {
		newProject: $("#newProject"),
		projectSelect: $("#selectProject"),
		newTask : $("#new-task-form"),
		taskList: $("#taskList"),
		projectList: $("#project-list"),
		projectInput: $("#project-input"),
		taskInput:$("#js-new-task-input"),
		projectError: $("#duplicateProjectError"),
		taskError: $("#duplicate-task-error")
	};

  getProjects(state, elems, setState);
	initProjectSubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);
	initbodyClickHandler(state, elems);

}

$(main);
