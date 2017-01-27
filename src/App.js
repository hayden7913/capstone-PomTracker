import React from 'react';
import ReactDOM from 'react-dom';

/*export default function() {
  return <div>Hello World</div>
}*/
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
    };
  }

  componentDidMount() {
    fetch(
      'http://localHost:8080/projects',
    )
    .then((res) => {
      return res.json();
    })
    .then(projects => this.state.projects)
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
