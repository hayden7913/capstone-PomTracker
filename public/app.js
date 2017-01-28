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
      callback(data)
    });
  });
}

const getProjectTasks = callback => {
  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;
    const taskId = data.projects[0].tasks[0]._id;
    $.getJSON(`${baseUrl}/${projectId}/tasks`, data => {
      console.log(JSON.stringify(data, null, 2));
      //const taskNames = data.tasks.map(task => task.taskName);
      callback(data.tasks);
    });
  });
}

const createProject = callback => {
  const newProject = {
      'projectName': 'Yet Another New Project',
      'tasks': [
        {
          'taskName': 'Sample Task',
          'total': 16,
          'log': [
            {
              'startTime': '8:23',
              'endTime': '13:34'
            }
          ]
        }
      ]
    };

  $.post(baseUrl, newProject, callback(displayPrettyJson), 'json');
}

const createTask = callback => {
  const newTask = {
    'taskName': 'Another Sample Task',
    'total': 16,
    'log': [
      {
        'startTime': '8:23',
        'endTime': '13:34'
      }
    ]
  }

  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;

    $.post(`${baseUrl}/${projectId}`, newTask, callback(displayPrettyJson), 'json')
  });

}

const updateProjectName = callback => {
  const newProjectName = {
    'projectName': 'Updated Project Name'
  }

  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;

    $.ajax({
      url: `${baseUrl}/${projectId}`,
      type: 'PUT',
      data: newProjectName,
      success: callback(displayPrettyJson)
    });
  });

}

const updateTask = callback => {
  const taskUpdates = {
    'taskName': 'Another Sample Task',
    'total': 25,
    'log': [
      {
        'startTime': '9:23',
        'endTime': '13:59'
      }
    ]
  }

  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;
    const taskId = data.projects[0].tasks[0]._id;
    console.log(projectId);

    $.ajax({
      url: `${baseUrl}/${projectId}/tasks/${taskId}`,
      type: 'PUT',
      data: taskUpdates,
      success: callback(displayPrettyJson)
    });

  });

}

const deleteProject = callback => {
  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;

    $.ajax({
  			url: `${baseUrl}/${projectId}`,
  			type: 'DELETE',
        success: callback(displayPrettyJson)
  		});
  });
}
//create a new project
//create a task

//update a project's name
//update properties of a task

//delete a project

//delete a task

 $(() => {
   //getProjectNames(displayPrettyJson);
   //getOneProjectName(displayData);
   //getProjectTasks(displayPrettyJson);
   //createProject(getProjectNames);
   //createTask(getOneProjectName);
   //updateProjectName(getOneProjectName);
   //updateTask(getOneProjectName);
   deleteProject(getOneProjectName)
 })
