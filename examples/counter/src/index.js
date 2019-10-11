//Imports

import React from "react";
import ReactDOM from "react-dom";
import StateStore, {root, container} from "react-3ducks";

//Store class

class CounterStore extends StateStore {
  
  // increment action

  increment = () => {
    this.setState({count: this.state.count + 1});
  }

  // decrement action

  decrement = () => {
    this.setState({count: this.state.count - 1});
  }
}

//Components

const Button = ({onClick, text}) => (
  <button onClick={onClick}>{text}</button>
)

const Label = ({text}) => (
  <span>{text}</span>
)

//Containers

const IncrementButton = container(Button, ({counterStore, props}) => ({
  onClick: counterStore.increment,
  text: "+"
}));

const DecrementButton = container(Button, ({counterStore}) => ({
  onClick: counterStore.decrement,
  text: "-"
}));

const CounterDisplay = container(Label, ({counterStore}) => ({
  text: counterStore.state.count
}));

//Store instance

const counterStore = new CounterStore({count: 0});

//Root

const App = root(() => (
  <div>
    <IncrementButton/>
    <CounterDisplay/>
    <DecrementButton/>
  </div>
), {counterStore})

//Render

ReactDOM.render(<App/>, document.getElementById("root"));