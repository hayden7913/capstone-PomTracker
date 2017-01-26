import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

/*export default function() {
  return <div>Hello World</div>
}*/
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: []
    };
  }

/*  componentDidMount() {
    axios.get(`http://localHost:8080/projects`)
      .then(res => {
        let dataArray = res.data.projects.map(project => <li> {project.projectName} </li>);
        this.setState({projects: dataArray})
      });
  }*/

  componentDidMount() {
    fetch(
      'http://localHost:8080/projects',
      {method: 'get'}
    )
    .then((res) => {
      return res.json();
    })
    .then(projects => console.log(projects))
  }

  render() {
    console.log(this.state.projects);

    return (
      <div>
        <ul>
          {this.state.projects}
        </ul>
      </div>
    );
  }
}
