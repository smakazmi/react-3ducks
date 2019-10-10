import React from "react";

export default class StateStore<T> {
  state: Partial<T> = {};
  _listeners = new Map();
  constructor(initialState: T) {
    this.setState(initialState);
  }

  _fireListeners(newState: Partial<T>) {
    const keys = Object.keys(newState);
    let filtered: Array<() => void> = [];
    keys.forEach(k => {
      const keyListeners = this._listeners.get(k);
      if (keyListeners) {
        filtered = filtered.concat(Array.from(keyListeners.values()));
      }
    });
    new Set(filtered).forEach(l => l());
  }

  setState(newState: Partial<T>) {
    this.state = { ...this.state, ...newState };
    this._fireListeners(newState);
  }

  subscribe(key: string, callback: () => void) {
    const keyListeners = this._listeners.get(key);
    if (keyListeners) {
      keyListeners.add(callback);
    } else {
      this._listeners.set(key, new Set([callback]));
    }
  }

  unsubscribe(callback: () => void) {
    Array.from(this._listeners.values()).forEach(l => l.delete(callback));
  }
}

function shallowCompare(newObj: any, prevObj: any, keys?: string[]) {
  if (newObj === prevObj) return true;
  if (
    typeof newObj !== "object" ||
    newObj === null ||
    typeof prevObj !== "object" ||
    prevObj === null
  ) {
    return false;
  }
  if (!keys) {
    keys = Object.keys(newObj);
  }
  for (let key of keys) {
    if (newObj[key] !== prevObj[key]) return false;
  }

  return true;
}

let StoresContext = React.createContext({});

export function root(RootComponent: React.ComponentType, stores: { [index: string]: StateStore<{}> }) {
  return function (props: any) {
    return (
      <StoresContext.Provider value={stores}>
        <RootComponent {...props} />
      </StoresContext.Provider>
    );
  };
}

export function container(ContainerComponent: React.ComponentType, mapState: (stores: { [index: string]: StateStore<{}> }, props: any) => any) {
  return class extends React.Component {
    stores: { [index: string]: StateStore<{}> } = {};

    updateState = () => {
      this.forceUpdate();
    };

    shouldComponentUpdate(nextProps: any) {
      if (!shallowCompare(nextProps, this.props)) return true;

      return false;
    }

    componentWillUnmount() {
      this.stores &&
        Object.keys(this.stores).forEach(k => {
          this.stores[k].unsubscribe(this.updateState);
        });
    }

    getStateProxy(store: StateStore<{}>) {
      const proxy = new Proxy(store.state, {
        get: (target: any, name: string) => {
          store.subscribe(name, this.updateState);
          return target[name];
        }
      });

      return proxy;
    }
    render() {
      return (
        <StoresContext.Consumer>
          {(stores: { [index: string]: StateStore<{}> }) => {
            const proxies: { [index: string]: StateStore<{}> } = {};
            this.stores = stores;
            Object.keys(stores).forEach(k => {
              stores[k].unsubscribe(this.updateState);
              proxies[k] = new Proxy(stores[k], {
                get: (target: any, name: string) => {
                  if (name !== "state") return target[name];
                  else return this.getStateProxy(stores[k]);
                }
              });
            });

            const newState = mapState ? mapState(proxies, this.props) : proxies;

            return <ContainerComponent {...this.props} {...newState} />;
          }}
        </StoresContext.Consumer>
      );
    }
  };
}
