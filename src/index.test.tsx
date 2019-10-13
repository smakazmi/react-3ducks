import StateStore, { root, container, _StoresContext as StoresContext } from "./index";
import React from "react";
import { shallow, mount } from "enzyme";

describe("StateStore", () => {
  it("should initialize successfully", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });
    expect(store.state).toEqual({ value: 0 });
  });

  it("should setState successfully", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });
    store.setState({ value: 1 });
    expect(store.state).toEqual({ value: 1 });
  });

  it("should subscribe successfully", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });
    const listener = jest.fn();
    store.subscribe("value", listener);
    store.setState({ value: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe successfully", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });
    const listener = jest.fn();
    store.subscribe("value", listener);
    store.setState({ value: 1 });
    store.unsubscribe(listener);
    store.setState({ value: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should not allow mutating state directly", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });

    expect(() => store.state = { value: 1 }).toThrow();
    expect(store.state.value).toBe(0);
  });

  it("should not allow setting the state property directly", () => {
    const store = new StateStore<{ value: number }>({ value: 0 });

    expect(() => store.state = { value: 1 }).toThrow();
    expect(store.state).toEqual({ value: 0 });
  });
});

describe("root", () => {
  it("should render context provider", () => {
    const testStore = new StateStore<{ value: number }>({ value: 0 });
    const contextValue = { testStore };
    const Cmp = root(React.Fragment, contextValue);

    const wrapper = shallow(<Cmp></Cmp>);

    expect(StoresContext).toBeDefined();
    if (StoresContext)
      expect(wrapper.is(StoresContext.Provider)).toBeTruthy();
    expect(wrapper.prop("value")).toEqual(contextValue)
  })

  it("should render wrapped component", () => {
    const testStore = new StateStore<{ value: number }>({ value: 0 });
    const contextValue = { testStore };
    const WrappedComponent = () => (<div></div>)
    const Cmp = root(WrappedComponent, contextValue);

    const wrapper = shallow(<Cmp />);
    expect(wrapper.childAt(0).is(WrappedComponent));
  })
})

describe("container", () => {
  it("should render context consumer", () => {
    const ContainerCmp = container(React.Fragment);
    const wrapper = shallow(<ContainerCmp />);

    expect(StoresContext).toBeDefined();
    if (StoresContext)
      expect(wrapper.is(StoresContext.Consumer)).toBeTruthy();
  })

  it("should pass stores to wrapped component", () => {
    type StateShape = { value: number };
    const testStore = new StateStore<StateShape>({ value: 0 });
    const contextValue = { testStore };
    const WrappedComponent = () => (<React.Fragment />);
    const RootCmp = root(React.Fragment, contextValue);
    const ContainerCmp = container(WrappedComponent);

    const wrapper = mount(<ContainerCmp />, { wrappingComponent: RootCmp });
    expect(wrapper.find(WrappedComponent).props()).toEqual(contextValue);
  })

  it("should pass stores and ownProps to mapToProps", () => {
    type StateShape = { value: number };
    const testStore = new StateStore<StateShape>({ value: 0 });
    const contextValue = { testStore };
    const WrappedComponent = () => (<React.Fragment />);
    const RootCmp = root(React.Fragment, contextValue);
    const expectedResult = {
      value: 0,
      testProp: "abc"
    };
    const mapToProps = jest.fn(({ testStore }, ownProps) => ({
      value: testStore.state.value,
      testProp: ownProps.testProp
    }));
    const ContainerCmp = container<any>(WrappedComponent, mapToProps);

    const wrapper = mount(<ContainerCmp testProp="abc" />, { wrappingComponent: RootCmp });
    expect(wrapper.find(WrappedComponent).props()).toEqual(expectedResult);
  })

  it("should pass and update WrappedComponent props with ContainerComponent props", () => {

    const WrappedComponent = () => (<React.Fragment />);

    const propsBefore = {
      testProp: "abc"
    };

    const propsAfter = {
      testProp: "abcd"
    };

    const ContainerCmp = container<any>(WrappedComponent);

    const wrapper = mount(<ContainerCmp testProp="abc" />);
    expect(wrapper.find(WrappedComponent).props()).toEqual(propsBefore);

    wrapper.setProps({ testProp: "abcd" });
    expect(wrapper.find(WrappedComponent).props()).toEqual(propsAfter);
  })

  it("should update WrappedComponent props when store state is updated", () => {
    type StateShape = { value: number };
    const testStore = new StateStore<StateShape>({ value: 0 });
    const contextValue = { testStore };
    const WrappedComponent = () => (<React.Fragment />);
    const RootCmp = root(React.Fragment, contextValue);
    const expectedResult = {
      value: 1
    };
    const mapToProps = jest.fn(({ testStore }) => ({
      value: testStore.state.value
    }));
    const ContainerCmp = container<any>(WrappedComponent, mapToProps);

    const wrapper = mount(<ContainerCmp />, { wrappingComponent: RootCmp });
    testStore.setState({ value: 1 });
    wrapper.update();
    expect(wrapper.find(WrappedComponent).props()).toEqual(expectedResult);
  })
})
