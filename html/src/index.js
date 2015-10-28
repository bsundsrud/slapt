import React, { Component } from 'react';
import { render } from 'react-dom';
import './styles';

var initialState = {

}

class Main extends Component {
    render() {
        return (<div>Hello, World!</div>)
    }
}

render(<Main/>, document.getElementById('root'));


