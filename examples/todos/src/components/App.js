import React from "react";
import Footer from "./Footer";
import AddTodo from "../containers/AddTodo";
import VisibleTodoList from "../containers/VisibleTodoList";
import TotalCounter from "../containers/TotalCounter";
import { root } from "react-3ducks";
import todosStore from "../store/TodosStore";

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
    <TotalCounter />
  </div>
);

export default root(App, { todosStore });
