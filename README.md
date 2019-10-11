# react-3ducks :duck: :hatched_chick: :hatching_chick:
A simple react global state management solution

## Installation
```js
npm install react-3ducks
```

## Why

Redux is currently the prevailing solution to manage global state in React apps. However, there are a few shortcomings to it that this project attempts to address. Some of them are as follows

- **Encapsulation**: Redux by convention has only one global store and it encapsulate only data. The behavior is fragmented between actions, action creators, reducers, epics, sagas, thunks etc. **react-3ducks** encourages and facilitates creation of multiple stores for various concerns in the application and also allows behavior encapsulation in the stores.
- **Asynchronous Behavior**: Redux has no built in way of handling asynchronous actions. **react-3ducks** fully supports asynchronous behavior through regular ```async/await``` or ```Promise``` based semantics that are already known and loved.
- **Complexity**: Its hard to quickly grasp what's going on in a Redux app. Mainly because of the fragmentation. There are many files and its not obvious what's going on where. **react-3ducks** addresses this by keeping all related logic and data together. 
- **Boilerplate**: The amount of boilerplate code in Redux apps is just too much. **react-3ducks** allows for very terse declaration and definition of both state and behavior.

## Example

This is a bare minimum example, Check out  [this](https://github.com/jamiebuilds/unstated-next) for a (relatively) more elaborate one

```jsx
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
```
See [this example](https://codesandbox.io/s/react-redeux-barebones-example-t0ws2) in action

## API

Time to introduce the three ducks (i.e. **```StateStore```**, **```root```**, and **```container```**)  in **react-3ducks**

### ```StateStore``` class
Encapsulates state and behavior. Should be extended to create separate specialized stores for e.g. CartStore, ProductsStore, AuthStore etc.

#### ```setState(newState)``` Method
```setState``` works exactly as it does in React components. It expects a partial object with state changes and merges it into the existing state.

#### ```state``` Property
```state``` also works exactly as it does in React components. Allows readonly access to the current state.

### ```root(Component, {store1, store2, ...})``` Higher Order Component
The **```root```** HOC accepts a Component and an object containing any stores that should be made available to the **```container```** objects under **```Component```**

### ```container(Component, mapToProps?)``` Higher Order Component
The **```container```** HOC passes stores as props to the **```Component```**. Alternatively, if its passed a second (optional) parameter i.e. **```mapToProps```**, it allows to map store state and behavior to props selectively.

#### ```mapToProps``` 
This is a selector function that can be optionally passed as a second parameter to the **```container```** HOC to allow for selective mapping of store state and behavior to props passed to the wrapped **```Component```**. Its defined as 

```
  function(stores, ownProps)
```
In the first parameter its passed an object containing all the stores connected to the **```root```** component. The second parameter contains the props passed to the wrapper component created by the **```container```** HOC.

Its expected to return a plain object with prop names as keys, mapped to state or behavior

## Contributing
Contributions are very welcome. Just send a PR against the master branch or open a new issue. Thanks!

