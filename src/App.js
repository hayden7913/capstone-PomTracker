import React from 'react';
import ReactDOM from 'react-dom';

/*export default function() {
  return <div>Hello World</div>
}*/
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projectNames: [],
    };
  }

  componentDidMount() {
    fetch(
      'http://localHost:8080/projects',
    )
    .then((res) => {
      return res.json();
    })
    .then(data => {
      let projectNames = data.projects.map((project, index) =>
          <li key={index}> {project.projectName} </li>
      );
       this.setState({projectNames: projectNames});
    })
  }

  render() {
    console.log(this.state.projectNames);

    return (
      <div>
        <ul>
          {this.state.projectNames}
        </ul>
      </div>
    );
  }
}
