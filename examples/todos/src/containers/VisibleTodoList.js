import TodoList from "../components/TodoList";
import { VisibilityFilters } from "../store/TodosStore";
import { container } from "react-3ducks";

function getVisibleTodos(todos, filter) {
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return todos;
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter(t => t.completed);
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter(t => !t.completed);
    default:
      return [];
  }
}

export default container(TodoList, ({ todosStore }) => ({
  todos: getVisibleTodos(todosStore.state.todos, todosStore.state.filter),
  toggleTodo: todosStore.toggleTodo
}));
