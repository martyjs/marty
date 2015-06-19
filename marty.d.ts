declare module 'marty' {
  import React = require('react');

  module Marty {
    interface Map<T> {
      [name: string]: T
    }

    interface FetchOptions<T> {
       id: string;
       locally?: () => T;
       remotely?: () => Promise<T>;
       dependsOn?: FetchResult<T> | Array<FetchResult<T>>;
       cacheError?: boolean;
    }

    interface WhenHandlers<T> {
      done(result: T): any;
      failed(error: any): any;
      pending(): any;
    }

    interface When<T> {
      (handlers: WhenHandlers<T>, context?: any): void;
      all(fetchResult: FetchResult<any>[], handlers: WhenHandlers<Array<any>>, context?: any): void;
      toPromise(): Promise<T>;
    }

    interface FetchResult<T> {
      status: string;
      failed: boolean;
      error?: any;
      result?: T;
      done: boolean;
      when: When<T>;
      toPromise: () => Promise<T>;
    }

    interface Fetch {
      <T>(options: FetchOptions<T>): FetchResult<T>;
      <T>(id: string, local: () => T, remote?: () => Promise<T>): FetchResult<T>;

      done<T>(result: T, id: string, store: Store<any>): FetchResult<T>;
      pending(id: string, store: Store<any>): FetchResult<any>;
      failed(error: any, id: string, store: Store<any>): FetchResult<any>;
      notFound(id: string, store: Store<any>): FetchResult<any>;
    }

    type MartyInstance = Store<any> | ActionCreators | Queries | StateSource;

    type MartyType = { new (...args: any[]): MartyInstance };

    interface RegisterMap {
      [id: string]: RegisterMap | MartyType;
    }

    class Application {
      register(map: RegisterMap): void;
      register(id: string, instance: MartyType): void;
    }

    class ApplicationContainer extends React.Component<{ app: Application }, {}> {}

    class Store<S> {
      state: S;
      handlers: any;
      dispatchToken: string;

      app: any;

      constructor(options: any);
      setState(nextState: S): void;
      replaceState(nextState: S): void;
      addChangeListener(callback: (state: S, store: Store<S>) => any, context: any): void;
      hasChanged(): void;
      fetch: Fetch;
      hasAlreadyFetched(id: string): boolean;
      waitFor(stores: Array<Store<any>>): void;
    }

    class ActionCreators {
      id: string;
      app: Marty;
      dispatch(type: string, ...data: any[]): void;
    }

    class Queries extends DispatchCoordinator {
      id: string;
      app: Marty;
      dispatch(type: string, ...data: any[]): void;
    }

    type ContainerConfigFetch = Map<Function> | (() => Map<Function>);

    interface ContainerConfig {
      listenTo: string | Array<string>;
      fetch?: ContainerConfigFetch;
      done?: (props: any) => React.ReactElement<any>;
      pending?: () => React.ReactElement<any>;
      failed?: (errors: any[]) => React.ReactElement<any>;
    }

    function createContainer(component: React.ComponentClass<any>, config?: ContainerConfig): React.ClassicComponentClass<{}>;

    class StateSource {
      id: string;
      type: string;
      mixins: Array<any>;

      app: any;
    }

    class CookieStateSource extends StateSource {
      get(key: string): any;
      set(key: string, value: any): boolean;
      expire(key: string): boolean;
    }

    interface RequestOptions {
      url: string;
      method?: string;
      headers?: Map<string>;
      body?: string | Object;
      contentType?: string;
      dataType?: string;
    }

    interface HttpFetch {
      text(): Promise<string>;
      json(): Promise<string>;
      headers: {
        get(key: string): string;
      }
      status: number;
      statusText: string;
    }

    interface HookOptions {
      id: string;
      priority?: number;
      before?: (req: any) => any;
      after?: (res: any) => any;
    }

    class HttpStateSource extends StateSource {
      baseUrl: string;
      request(options: RequestOptions): Promise<HttpFetch>;
      get(url: string): Promise<HttpFetch>;
      get(options: RequestOptions): Promise<HttpFetch>;
      post(url: string): Promise<HttpFetch>;
      post(options: RequestOptions): Promise<HttpFetch>;
      put(url: string): Promise<HttpFetch>;
      put(options: RequestOptions): Promise<HttpFetch>;
      delete(url: string): Promise<HttpFetch>;
      delete(options: RequestOptions): Promise<HttpFetch>;

      static addHook(options: HookOptions): void;
      static removeHook(options: HookOptions): void;
    }

    class JSONStorageStateSource extends StateSource {
      storage: any;
      namespace: string;

      get(key: string): any;
      set(key: string, value: any): void;
    }

    class LocalStorageStateSource extends JSONStorageStateSource {}

    class SessionStorageStateSource extends JSONStorageStateSource {}

    interface LocationInformation {
      url: string;
      path: string;
      hostname: string;
      query: Map<string>;
      protocol: string;
    }

    class LocationStateSource extends StateSource {
      getLocation(): LocationInformation
    }

    function get(type: string, id: string): any;

    function getAll(type: string): any[];

    function getDefault(type: string, id: string): any;

    function getAllDefaults(type: string): any[];

    function resolve(type: string, id: string, options?: Object): any;

    interface Dispatcher {
      id: string;
      isDefault: boolean;
      dispatchAction(options: Object): any;
      onActionDispatched(callback: (action: any) => any, context?: any): void;
    }

    var dispatcher: Dispatcher;

    interface ConstantsOption {
      [key: string]: string[] | ConstantsOption;
    }

    function createConstants(constants: string[] | ConstantsOption): any;

    interface Warnings {
      without(warningsToDisable: string[], callback: () => any, context?: any): void;
      invokeConstant: boolean;
      reservedFunction: boolean;
      cannotFindContext: boolean;
      classDoesNotHaveAnId: boolean;
      stateIsNullOrUndefined: boolean;
      callingResolverOnServer: boolean;
      stateSourceAlreadyExists: boolean;
      superNotCalledWithOptions: boolean;
      promiseNotReturnedFromRemotely: boolean;
      contextNotPassedInToConstructor: boolean;
    }

    var warnings: Warnings;

    function createInstance(): typeof Marty;

    function dispose(): void;

    var version: string;

    var isServer: boolean;

    var isBrowser: boolean;
  }

  import M = Marty;

  export = M;
}
