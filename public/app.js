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

const displayTaskNames = (data) => {
  const taskListArray = data[Object.keys(data)[0]];
  const resHtml = taskListArray.map(task => {
    return `<p>${task.name}</p>`
  });
  $("body").append(resHtml);
}

const getTaskList = (callback) => {
  setTimeout(() => {callback(TASKLIST)}, 100);
}



$(() => getTaskList(displayTaskNames))
