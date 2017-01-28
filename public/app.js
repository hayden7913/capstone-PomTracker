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

const deleteTask = callback => {
  $.getJSON(baseUrl, data => {
    const projectId = data.projects[0]._id;
    const taskId = data.projects[0].tasks[0]._id;

    $.ajax({
      url: `${baseUrl}/${projectId}/tasks/${taskId}`,
      type: 'DELETE',
      success: callback(displayPrettyJson)
    });
  });
}

 $(() => {
   //getProjectNames(displayPrettyJson);
   //getOneProjectName(displayData);
   //getProjectTasks(displayPrettyJson);
   //createProject(getProjectNames);
   //createTask(getOneProjectName);
   //updateProjectName(getOneProjectName);
   //updateTask(getOneProjectName);
   //deleteProject(getProjectNames)
   //deleteTask(getOneProjectName)
 })

//ignore the following:
 /*const TASKLIST = {
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
*/
