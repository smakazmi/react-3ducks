import { createContext, createElement, Component } from "react";
import autobind from "auto-bind";
export type StoresByKey = { [index: string]: StateStore<{}> };
export type StateUpdatedCallback = () => void;

export default class StateStore<T> {
  private _state: T;
  private listeners: Map<string, Set<StateUpdatedCallback>> = new Map();
  constructor(initialState: T) {
    this._state = Object.freeze(initialState);
    autobind(this);
  }

  get state(): T {
    return this._state;
  }

  set state(_: T) {
    throw new Error("use setState or store actions to mutate the state");
  }

  private fireListeners(newState: Partial<T>) {
    const keys = Object.keys(newState);
    let filtered: Array<StateUpdatedCallback> = [];
    keys.forEach(k => {
      const keyListeners = this.listeners.get(k);
      if (keyListeners) {
        filtered = filtered.concat(Array.from(keyListeners.values()));
      }
    });
    new Set(filtered).forEach(l => l());
  }

  setState(newState: Partial<T>) {
    this._state = Object.freeze({ ...this._state, ...newState });
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

const StoresContext = createContext({});

export const _StoresContext = global.__DEV__ ? StoresContext : undefined;

export const root = (
  RootComponent: React.ComponentType,
  stores: StoresByKey
) => (props: any) =>
  createElement(
    StoresContext.Provider,
    { value: stores },
    createElement(RootComponent, { ...props })
  );

export function container<P, S extends StoresByKey = StoresByKey>(
  ContainerComponent: React.ComponentType<P>,
  mapState?: (stores: S, props: any) => any
): React.ComponentType<Partial<P>> {
  return class extends Component {
    stores: StoresByKey = {};

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
      return createElement(StoresContext.Consumer, {
        children: (stores: StoresByKey) => {
          const proxies: StoresByKey = {};
          this.stores = stores;
          Object.keys(stores).forEach(k => {
            stores[k].unsubscribe(this.updateState);
            proxies[k] = this.getStoreProxy(stores[k]);
          });

          const newState = mapState
            ? mapState(proxies as S, this.props)
            : proxies;
          const mergedProps = {
            ...newState,
            ...this.props
          };

          return createElement<any>(ContainerComponent, mergedProps);
        }
      });
    }
  };
}
