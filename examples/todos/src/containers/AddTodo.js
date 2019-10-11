import React from "react";
import { container } from "react-3ducks";

const AddTodo = ({ todosStore }) => {
  let input;
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          todosStore.addTodo(input.value);
          input.value = "";
        }}
      >
        <input ref={node => (input = node)} />
        <button type="submit">Add Todo</button>
        <button type="button" onClick={todosStore.addRandomTodo}>
          Add Random
        </button>
      </form>
    </div>
  );
};

export default container(AddTodo);
