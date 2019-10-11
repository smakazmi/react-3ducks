import StateStore from "react-redeux";
import axios from "axios";

export class TodosStore extends StateStore {
  nextTodoId = 1;
  addTodo = text => {
    this.setState({
      todos: [
        ...this.state.todos,
        { id: this.nextTodoId++, text, completed: false }
      ]
    });
  };
  toggleTodo = id => {
    this.setState({
      todos: this.state.todos.map(t => ({
        ...t,
        completed: t.id === id ? !t.completed : t.completed
      }))
    });
  };

  addRandomTodo = async () => {
    const { data } = await axios.get("https://api.quotable.io/random");

    this.addTodo(data.content);
  };
  setVisibilityFilter = filter => {
    this.setState({ filter });
  };
}

export const VisibilityFilters = {
  SHOW_ALL: "SHOW_ALL",
  SHOW_COMPLETED: "SHOW_COMPLETED",
  SHOW_ACTIVE: "SHOW_ACTIVE"
};

export default new TodosStore({
  todos: [],
  filter: VisibilityFilters.SHOW_ALL
});