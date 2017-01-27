/*
-Okay if I identify tasks by name?
- Add tasks
- Delete tasks
- Update tasks
- Add projects
- Delete projects
- Change project name
- Add log entry
- Delete log entry
- Update log entry

- Functions: Add-push, Delete-pull, Update-set
-
*/


const TASKLIST = {
  tasks: [
    {
      "id": "11111",
      "name": "Design MVP",
      "parent": "Node Capstone",
      "total": "1"
    },
    {
      "id": "22222",
      "name": "Set up CI",
      "parent": "Node Capstone",
      "total": "0.5"
    },
    {
      "id": "33333",
      "name": "Implement MVP",
      "parent": "Node Capstone",
      "total": "4"
    },
    {
      "id": "44444",
      "name": "Gather User Feedback and Iterate",
      "parent": "Node Capstone",
      "total": "4"
    }
  ]
};
//display all projects
//display a single project
//display all of a projects tasks



const baseUrl = 'http://localHost:8080/projects';

const displayPrettyJson = data => {
  $('body').append(`<pre> ${JSON.stringify(data, null, 2)} </pre>`);
}

const displayData = data => {
  const resHtml = data.map(element =>
      `<p>${element}</p>`
  );
  $('body').append(resHtml);
}

const getProjectNames = callback => {
  $.getJSON(baseUrl, data => {
      //const projectNames = data.projects.map(project => project.projectName);
      callback(data);
  })
}

const getOneProjectName = callback => {
  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;
    $.getJSON(`${baseUrl}/${projectId}`, data => {
      callback([data.projects.projectName])
    });
  });
}

const getProjectTasks = callback => {
  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;
    const taskId = data.projects[0].tasks[0]._id;
    console.log(taskId);
    $.getJSON(`${baseUrl}/${projectId}/tasks`, data => {
      console.log(JSON.stringify(data, null, 2));
      //const taskNames = data.tasks.map(task => task.taskName);
      callback(data.tasks);
    });
  });
}

const createProject = callback => {
  const newProject = {
      "projectName": "Yet Another New Project",
      "tasks": [
        {
          "taskName": "Sapmle Task",
          "total": 16,
          "log": [
            {
              "startTime": "8:23",
              "endTime": "13:34"
            }
          ]
        }
      ]
    };

  $.post(baseUrl, newProject, callback(displayPrettyJson), "json");
}

const createTask = callback => {
  const newProject = {
          "taskName": "Another Sapmle Task",
          "total": 16,
          "log": [
            {
              "startTime": "8:23",
              "endTime": "13:34"
            }
          ]
    };

  $.post(baseUrl, newProject, callback(displayPrettyJson), "json");
}

const updateProject = callback => {
  $.ajax({
    url: "/tasks",
    type: "PUT",
    data: proj,
    success: (data) => {console.log("save successful")}
  });
}
//create a new project

//create a task
//update a project's name
//delete a project
//update properties of a task
//delete a task

 $(() => {
   //getProjectNames(displayPrettyJson);
   //getOneProjectName(displayData);
   //getProjectTasks(displayPrettyJson);
   //createProject(getProjectNames)
   //createProject(getProjectNames)

 })
