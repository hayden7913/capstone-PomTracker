
const state = {
	projects: ["none", "Sample Project"],
	tasks: [],
	errorMessage: {
		duplicateProject: 'That project already exists. Please use a different project name',
		duplicateTask: 'That task already exists. Please use a different project name',
		invalidTime: 'Please enter a time that is greater than 0'
	}
}


const minutesToHours = (min) => {
	return Number((Number(min)/60).toFixed(2));
}

function Task(name, totalTime, project) {
	this.name = name;
	this.project = project;
	this.totalTime = Number(totalTime);
	this.history = [totalTime];
}

Task.prototype.addTime = function(state, elems, t) {
	this.totalTime += minutesToHours(t);

	if (this.history) {
		 this.history.push(this.totalTime);
	}

	if(this.projectAddTime) {
		this.projectAddTime(t);
	}

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

function Project(name , tasks) {
  this.projectName = name;
  this.tasks = tasks;
}

Project.prototype.calculateTotalProjectTime = function () {
   return this.tasks
            	.map(task => task.totalTime)
            	.reduce((a,b) => a+b)
}

const sampleTask1 = new Task("sample task", 1 , "Sample Project");
const sampleTask2 = new Task("another sample task" , 2 , "Sample Project");

state.tasks.push(sampleTask1);
state.tasks.push(sampleTask2);

const displayErrror = (element, error) => {
	element.text('error');
}

const saveTask = (task) => {
	const callback = () => console.log("Task Saved");
	const postObj = {
		"name": task.name,
		"project": task.project,
		"totalTime": task.totalTime
	}
	$.post("/tasks", postObj, callback, "json");
}

const updateAllTasks = (state) => {
	state.tasks.forEach((task) => {
		$.ajax({
			url: "/tasks",
			type: "PUT",
			data: task,
			success: (data) => {console.log("save successful")}
		});
	});
}

const setState = (state, elems, data) => {

	const callback = data => {
	  state.projects = data.projects.map(project => {
	    const tasks = project.tasks.map(task => new Task (task.taskName, task.total, task.log));
	    return new Project(project.projectName, tasks);
	  });
		renderTaskList(state, elems);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
	}
	const callback = (data) => {
		state.tasks = data.tasks.map( task => {

			if(state.projects.indexOf(task.project) === -1) {
				state.projects.push(task.project);
			}

			return new Task(task.name, task.totalTime, task.history, task.project)
		});

		renderTaskList(state, elems);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
	}
}

const getProjects = callback => {
	$.getJSON("/projects", data => callback(data))
}


const deleteTask = (state, idx, elems) => {
	/*$.ajax({
			url: "/tasks",
			type: "DELETE",
			data: state.tasks[idx]
		});*/
		bootbox.confirm(
			`Are you sure you want to delete \"${name}\"`,
			 () => {
				 state.tasks.splice(idx, 1);
				 renderTaskList(state, elems);
			 });
}

const deleteProject = (state, elems, projectName) => {
	state.tasks.forEach(task => {
		if (task.project === projectName) {
			task.project = null;
		}
	});

	state.projects = state.projects.filter(project => {
		return project !== projectName;
	});

	renderProjectList(state, elems);
	renderProjectOptions(state, elems);
	//updateAllTasks(state);
}

const getProjectValues = () => {
	const obj = {};
		state.tasks.forEach((task) => {
			obj[task.project] ? obj[task.project] += task.totalTime : obj[task.project] = task.totalTime;
		});

		return obj;
}

const renderOneProject = (state, elems, projectName, value) => {
	const resHtml = $(
		`<div>
			<div id="projectWrapper">
				<span class="project">${projectName}</span>
				<span class="projectValue">${value}</span>
				<button id="deleteProject" class="btn btn-outline-secondary">X</button>
			</div>
		</div>`
	);

	resHtml.find("#deleteProject").click(() => {
		deleteProject(state, elems, projectName);
	});
	return resHtml;
}

const renderProjectList = (state, elems) => {
	const projects = getProjectValues();
	const resHtml = Object
		.keys(projects)
		.filter(key => key !== "none" && key !== "")
		.map(key => {
		return renderOneProject(state, elems, key, projects[key]);
	});
	$("#projects").html(resHtml);
}

const renderTask = (state, elems, name, totalTime, project, idx) => {
 let task = state.tasks[idx];
 let template = $(
	`<div id="wrapper">
		<div class="timeMod well">
				<div class="topRow">
					<span class="title">${name}</span>
					<span class="acctotal">${totalTime.toFixed(2)}</span>
					<span class="project">${project}<span>
				</div>
			<div class="btn-group timeButtons">
				<button type="button" class="js-btn5 btn btn-primary">5</button>
				<button type="button" class="js-btn15 btn btn-primary">15</button>
				<button type="button" class="js-btn25 btn btn-primary" value="25">25</button>
				<input type="text" name="" id="customInput${idx}" class="customInput form-control">
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

 	template.find(`#customInput${idx}`).on("keyup", (e) => {
 		const code = e.which;
 		if (code == 13) {
 			e.preventDefault();
			const input = Number($(`#customInput${idx}`).val());
 			task.addTime(input);
 			renderTaskList(state, elems);
 			//updateAllTasks(state);
 			//this.reset;
 		}
 	})

 	template.find("#js-undo").click( () => {
 		task.undo(state, elems);
 		renderTaskList(state, elems);
 	})

 	template.find("#js-delete").click( () => {
		deleteTask(state, idx, elems)
		/*bootbox.confirm(
			`Are you sure you want to delete \"${name}\"`,
			 () => 'deleted' //deleteTask(state, idx)
		);*/
 	});

 	template.find(".btn").click(() => {
 		renderTaskList(state, elems);
 		//updateAllTasks(state);

 	});
 	return template;
}

const renderTaskList = (state, elems) => {
	let resHtml = state.tasks.map((task, idx) => {
		return renderTask(state, elems, task.name, task.totalTime, task.project, idx)
	});

	elems.taskList.html(resHtml.reverse());
}

renderProjectOptions = (state, elems) => {
	resHtml = state.projects
	.filter(project => project !== "")
	.map((project) => {
		return `<option value="${project}">${project}</option>`;
	});

	elems.projectSelect.html(resHtml);
}

const initProjectSubmitHandler = (state,elems) => {
	$(elems.newProject).on("submit", (e) => {
		e.preventDefault();
		let name;
		name = elems.projectName.val();
		state.projects.push(name);
		renderProjectOptions(state, elems);
		renderProjectList(state, elems);
		elems.projectName.val("");
		//saveTask(state.tasks[state.tasks.length-1]);
		//renderTaskList(state, elems);
	});
}

const initTaskSubmitHandler = (state, elems) => {
	$(elems.newTask).on("submit", (e) => {
		e.preventDefault();

		const name = elems.taskName.val();
		const selectedProject = $("#selectProject :selected").text();
		const taskProject = selectedProject === "none" ? undefined : selectedProject;
		state.tasks.push(new Task(name, 0, taskProject));
		//saveTask(state.tasks[state.tasks.length-1]);
		renderTaskList(state, elems);
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
		taskName:$("#taskName")
	};

	//getTasks(state, elems);
	renderProjectOptions(state, elems);
	renderProjectList(state, elems);
	renderTaskList(state, elems);
	initProjectSubmitHandler(state, elems);
	initTaskSubmitHandler(state, elems);

}

$(main);
