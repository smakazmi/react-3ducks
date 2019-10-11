import React from "react";
import { container } from "react-3ducks";

const TotalCounter = ({ totalTodos }) => (
  <div>
    <span>Total: {totalTodos} </span>
  </div>
);

export default container(TotalCounter, ({ todosStore }) => ({
  totalTodos: todosStore.state.todos.length
}));
