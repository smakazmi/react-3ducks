import { container } from "react-3ducks";
import Link from "../components/Link";

export default container(Link, ({ todosStore }, props) => ({
  active: props.filter === todosStore.state.filter,
  onClick: () => todosStore.setVisibilityFilter(props.filter)
}));
