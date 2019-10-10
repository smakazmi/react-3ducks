import React from "react";

export type StoresByKey = { [index: string]: StateStore<{}> };
export type StateUpdatedCallback = () => void;
export default class StateStore<T> {
  private _state: Partial<T> = {};
  private listeners: Map<string, Set<StateUpdatedCallback>> = new Map();
  constructor(initialState: T) {
    this.setState(initialState);
  }

  get state(): Partial<Readonly<T>> {
    return this._state;
  }

  set state(_: Partial<T>) {
    throw new Error("use set state or store actions to mutate the state");
  }

  private fireListeners(newState: Partial<T>) {
    const keys = Object.keys(newState);
    let filtered: Array<() => void> = [];
    keys.forEach(k => {
      const keyListeners = this.listeners.get(k);
      if (keyListeners) {
        filtered = filtered.concat(Array.from(keyListeners.values()));
      }
    });
    new Set(filtered).forEach(l => l());
  }

  setState(newState: Partial<T>) {
    this._state = { ...this._state, ...newState };
    this.fireListeners(newState);
  }

  subscribe(key: string, callback: StateUpdatedCallback) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.add(callback);
    } else {
      this.listeners.set(key, new Set([callback]));
    }
  }

  unsubscribe(callback: StateUpdatedCallback) {
    Array.from(this.listeners.values()).forEach(l => l.delete(callback));
  }
}

let StoresContext = React.createContext({});

export const root = (RootComponent: React.ComponentType, stores: StoresByKey) =>
  (props: any) => React.createElement(StoresContext.Provider, { value: stores },
    React.createElement(RootComponent, { ...props }));

export function container(ContainerComponent: React.ComponentType, mapState: (stores: { [index: string]: StateStore<{}> }, props: any) => any) {
  return class extends React.Component {
    stores: { [index: string]: StateStore<{}> } = {};

    updateState = () => {
      this.forceUpdate();
    };

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

    getStoreProxy(store: StateStore<any>) {

      return new Proxy(store, {
        get: (target: any, name: string) => {
          if (name !== "state") return target[name];
          else return this.getStateProxy(store);
        }
      });
    }

    render() {
      return (
        <StoresContext.Consumer>
          {(stores: { [index: string]: StateStore<{}> }) => {
            const proxies: StoresByKey = {};
            this.stores = stores;
            Object.keys(stores).forEach(k => {
              stores[k].unsubscribe(this.updateState);
              proxies[k] = this.getStoreProxy(stores[k]);
            });

            const newState = mapState ? mapState(proxies, this.props) : proxies;

            return <ContainerComponent {...this.props} {...newState} />;
          }}
        </StoresContext.Consumer>
      );
    }
  };
}
