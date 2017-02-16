
const state = {
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
		this.history.push(this.totalTime);

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

function Project(name, position, tasks, id) {
  this.name = name;
	this.position = position;
  this.tasks = tasks;
  this.id = id;
}

Project.prototype.calculateTotalProjectTime = function () {
	return this.tasks.length ? this.tasks.map(task => task.totalTime).reduce((a,b) => a+b) : 0;
}

const pushNewProject = (state, elems, data) => {
		state.projects.push(new Project(data.projectName, data.position, data.tasks, data._id));

		renderProjectList(state, elems);
}

const createProject = (state, elems, name) => {

	const newProject = {
			'projectName': name,
			'position': state.projects.length,
			'tasks': []
		};

		$.ajax({
      url: `/projects`,
      type: 'POST',
			data: newProject,
      success: data => pushNewProject(state, elems, data),
			error: err => {
				if (err.status === 409) {
					elems.projectError.text(err.responseText);
				}
			}
		});

}

const setState = (state, elems, data) => {
  state.projects = data.projects.map(project => {
    const tasks = project.tasks.map(task => new Task (task.taskName, task.totalTime, task.log, task._id));
    return new Project(project.projectName, project.position, tasks, project._id);
  });

  	renderProjectList(state, elems);
}

const getProjects = (state, elems, callback) => {
	$.getJSON("/projects", data => callback(state, elems, data) );
}

const findIndexById = (array, id) => {
	return array.findIndex(element => element.id === id);
}

const pushNewTask = (state, elems, parentProjectId, task) => {

	const projectIndex = findIndexById(state.projects, parentProjectId);

	state.projects[projectIndex].tasks.push(new Task(task.taskName, 0 , task.log, task._id))

	renderProjectList(state, elems);
	elems.projectList.find(`#${state.focusedFormId}`).find("input").focus();
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
      success: data => pushNewTask(state, elems, parentProjectId, data), //() => getProjectById(state, elems, parentProjectId, pushNewTask.bind(null, state, elems, parentProjectId)),
			error: err => {
				if (err.status === 409){
					elems.projectList.find(`#task-error-${parentProjectId}`).text(err.responseText)
				}
			}
    });
}

const updateTask = (state, elems, task, projectId) => {

	const updatedTask = {
    'taskName': task.name,
    'totalTime': task.totalTime,
    'log': task.log,
		'_id': task.id
  };

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

      renderProjectList(state, elems);
    }
  }
	myConfirm(confirmMessage, "button", onConfirm);
  // bootbox.confirm(confirmMessage, onConfirm);
}

const renderTask = (state, elems, task, project) => {
	const projectName = project.name;
	const template = $(

		`
						<div class="time-mod-wrapper">
							<div class="time-mod well">
									<div class="top-row">
										<div class="task-name name">${task.name}</div>
										<span class="total-task-time">${minutesToHours(task.totalTime)}</span>
									</div>
								<div class="time-controls">
									<div class="button-group">
										<button type="button" class="js-btn5 button button-group button-left">+5m</button>
										<button type="button" class="js-btn15 button button-group">+15m</button>
										<button type="button" class="js-btn25 button button-group button-right" value="25">+25m</button>
									</div>
									<form id="custom-input-form-${task.id}" class="custom-input-form">
										<input id="custom-input-${task.id}" type="text" class="custom-input" placeholder="+m" >
										<button class="custom-input-submit-button" type="submit">
											<i class="fa fa-plus custom-input-submit-icon" aria-hidden="true"></i>
										</button>
									</form>
							</div>
									<span id="invalid-time-error-${task.id}" class="error"></span>
								<div class="control-buttons">
									<button type="button" id="js-reset" class="button" >Reset</button>
									<button type="button" id="js-undo" class="button" >Undo</button>
									<button type="button" id="js-delete" class="button" >Delete</button>
								</div>
							</div>
						</div>`);

 	template.find(".js-btn5").click( () => {
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

 	template.find(`#custom-input-form-${task.id}`).on("submit", (e) => {
 			e.preventDefault();

			const input = Number($(`#custom-input-${task.id}`).val());
			if (isNaN(input)) {
				$(`#invalid-time-error-${task.id}`).text(state.errorMessage.customInputNan);
			} else {
				task.addTime(state, elems, input);
				this.reset;
				updateTask(state, elems, task, project.id);
				renderProjectList(state, elems);
			}
 	});

 	return template;
}

const renderTaskList = (state, elems, project) => {
	const taskListHtml = project.tasks.map(task => renderTask(state, elems, task, project));
	return taskListHtml.reverse();
}



const renderProject = (state, elems, project) => {
	const taskListHtml = renderTaskList(state, elems, project);
	const taskListWrapperHtml = $(`<div id="js-task-list-wrapper" class="task-list-wrapper"></div>`)
	const taskFormId =`js-task-form-${project.id}`
	const taskErrorId = `task-error-${project.id}`
	const projectContainerTemplate = $(

	`
		<div id="js-project-wrapper" class="project-wrapper well" >
				<span id="js-remove" class="glyphicon glyphicon-remove"></span>
				<div class="project-header">
					<div class="project-name">${project.name}</div>
					<div class="total-project-time">${minutesToHours(project.calculateTotalProjectTime())}</div>
				</div>
				<div id="js-add-new-task" class="add-new-task ">Add new task..</div>
				<form id=${taskFormId} class="new-task-form ${taskFormId === state.focusedFormId ? "" : "hide"}">
					<input  class="new-task-input name-input" placeholder="Enter Task Name" type="text"></input>
						<button class="plus">
							<i class="fa fa-plus " aria-hidden="true"></i>
						</button>
				</form>
				<div id=${taskErrorId} class="error task-error"></div>
		</div>

	`);

		projectContainerTemplate.find("#js-add-new-task").click( (e) => {
			e.stopPropagation();
			//Hide all task forms
			elems.projectList.find('.new-task-form').addClass("hide");
			//Then show clicked task form
			elems.projectList.find(`#${taskFormId}`).removeClass("hide") .find("input").focus();
			state.focusedFormId = `${taskFormId}`;
		});

		projectContainerTemplate.find(`#${taskFormId}`).on("submit", function(e) {
			e.preventDefault();

			const name = $(this).find("input").val();

			if (!(name == null || name.trim() === '')){
				elems.taskError.text("");
				createTask(state, elems, name, project.id);
				$(`#${taskFormId}`).val("");
			} else {
				console.log('hello');
				elems.projectList.find(`#${taskFormId}`).find("input").focus();
				elems.projectList.find(`#task-error-${project.id}`).text(state.errorMessage.emptyTask);
			}
		});

		projectContainerTemplate.find("#js-remove").click(() => {
				deleteProject(state, elems, project);
		});

		const inner = projectContainerTemplate.append(taskListWrapperHtml.html(taskListHtml));
  	const result = $(`<div class="col3"><div>`).append(inner);

		return result;
}

const renderProjectList = (state, elems) => {
	const projectListHtml = state.projects
															 .map(project => renderProject(state, elems, project))
															 .sort((a,b) => a.position - b.position)
															 .reverse();

	elems.projectList.html(projectListHtml);
}

const initProjectSubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();

		const name = elems.projectInput.val();
		console.log(name);
		if (!(name == null || name.trim() === '')){
			elems.projectError.text("");
			createProject(state, elems, name);
			elems.projectInput.val("");
		} else {
			elems.projectInput.focus();
			elems.projectError.text(state.errorMessage.emptyProject);
		}


	});
}

const initbodyClickHandler = (state, elems) => {
	$("body").on("click", (e) => {
		e.stopPropagation();

		elems.projectList.find(".error").text("");
		elems.projectError.text("");

console.log('hello');

		if (!$(e.target).hasClass("new-task-input") && !$(e.target).hasClass('task-submit-button') && !$(e.target).hasClass('plus') ) {
				elems.projectList.find(".new-task-form").addClass("hide");
				state.focusedFormId = null;
		}
	});
}

const main = () => {

	const elems = {
		newProject: $("#new-project-form"),
		projectSelect: $("#selectProject"),
		newTask : $("#new-task-form"),
		taskList: $("#taskList"),
		projectList: $("#project-list"),
		projectInput: $("#new-project-input"),
		taskInput:$("#js-new-task-input"),
		projectError: $("#project-error"),
		taskError: $("#task-error"),
		timeInputError: $("#invalid-time-error")
	};

  getProjects(state, elems, setState);
	initProjectSubmitHandler(state, elems);
	initbodyClickHandler(state, elems);

}

$(main);
