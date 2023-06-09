import type { ComponentProps, AllType, FrameworkKeys, TypeMap, UnitProps } from '@zodui/core'

import { Framework } from './framework'

export * from './base'
export type {
  ComponentProps,
  FrameworkComponents,
  Icons
} from './components'
export * from './framework'

const effectSymbol = Symbol('effect')

type Rule<N extends keyof UnitMap> =
  | string[]
  | [N] extends [never]
    ? { (modes: string[]): boolean }
    : { (modes: string[], opts?: UnitMap[N]['options']): boolean }

type MatcherRndr<
  C,
  N extends keyof UnitMap = never
> =
  | string
  | (
    [C] extends [never]
      // When the component is not set, returns a function that takes props and returns a component Rndr String and its props
      ? ((
        props:
          & { modes: string[] }
          & UnitMap[N]['options']
      ) => [rndrTarget: string, props: Record<string, any>])
      : C
  )
  | [rndrTarget: string, props: Record<string, any>]

export type Matcher<
  C,
  N extends keyof UnitMap = never
> =
  | [rule: Rule<N>, rndr: MatcherRndr<C, N>]

export interface UnitMap {
  [key: string]: {
    props: unknown
    options: unknown
  }
  monad: {
    props: {}
    options: {}
  }
  complex: {
    props: {
      options: ComponentProps.SelectOptions[]
      OptionRender: any
    }
    options: {}
  }
  multiple: {
    props: {
      schemas: TypeMap[AllType][]
      onChange?: (value: any[]) => void | Promise<void>
    }
    options: {
      schemas: TypeMap[AllType][]
    }
  }
}

export interface UnitFrameworksComp<
  /* eslint-disable @typescript-eslint/no-unused-vars */
  N extends keyof UnitMap = keyof UnitMap,
  Props = {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
> {
  [key: FrameworkKeys]: unknown
}

export interface DefineUnit<
  PluginName extends string = string,
  FK extends FrameworkKeys = never,
  This = [FK] extends [never]
    ? Context<PluginName>
    : Framework<FK, PluginName>
> {
  <
    N extends keyof UnitMap,
    T extends AllType
  >(
    this: This,
    name: N,
    types: T[],
    matchers: Matcher<
      [FK] extends [never] ? never : UnitFrameworksComp<
        N,
        & Omit<UnitProps<T, TypeMap[T]>, keyof UnitMap[N]['props']>
        & UnitMap[N]['props']
      >[FK],
      N
    >[]
  ): This
  composer<T extends AllType>(this: This, types: T[], matchers: Matcher<never>[]): This
  switcher<T extends AllType>(this: This, types: T[], matchers: Matcher<never>[]): This
}

export function createDefineUnit<
  PluginName extends string = string,
  FK extends FrameworkKeys = never,
  This = FK extends never
    ? Context<PluginName>
    : Framework<FK, PluginName>
>(
  ctx: Context<PluginName>,
  framework?: Framework<FK>
) {
  type DU = DefineUnit<PluginName, FK, This>
  const innerThis = (framework ?? ctx) as This
  const prevKey = framework ? `framework.${framework.key}.units` : `units`
  let du = function (name, types, matchers) {
    const keys = types.map(type => `${prevKey}.${name}.${type}`)

    keys.forEach(k => {
      ctx.upd<typeof matchers>(
        k, (list = []) => {
          return list.concat(matchers)
        }, list => {
          return list.filter(m => !matchers.includes(m))
        }
      )
    })
    return this
  } as DU
  // bind will lose fields, so we need bind ctx when create du
  // bind type infer is not good, so we need to use `as` to fix it
  du = du.bind(innerThis) as DU
  du.composer = function (types, matchers) {
    // TODO set it to store
    return this
  }
  du.composer = du.composer.bind(innerThis)
  du.switcher = function (types, matchers) {
    // TODO set it to store
    return this
  }
  du.switcher = du.switcher.bind(innerThis)
  return du
}

class Emitter {
  #listeners = new Map<string, Function[]>()
  on(key: string, func: Function) {
    const list = this.#listeners.get(key) || []
    const index = list.length
    list.push(func)
    this.#listeners.set(key, list)
    return () => {
      list.splice(index, 1)
      this.#listeners.set(key, list)
    }
  }
  do(...args: any[]) {
    const [key, ...params] = args
    const list = this.#listeners.get(key) || []
    list.forEach(func => func(...params))
  }
}

/**
 * Contexts extended by the same Context share the same store
 * The `extend` method is used to record the side effects of the next operation
 * When you need to reclaim the side effects of this segment, you only need to call the off function,
 * or execute the functions from `[effectSymbol]` filed
 */
export class Context<
  PluginName extends string = string
> {
  static global = new Context()
  // eslint-disable-next-line indent
  ;[effectSymbol]: Function[] = []
  defineUnit: DefineUnit<PluginName>
  constructor(
    private readonly store = new Map<string, any>(),
    private readonly emitter = new Emitter()
  ) {
    this.defineUnit = createDefineUnit(this)
  }
  extend() {
    return new Context(this.store, this.emitter)
  }
  set(k: string, v?: any) {
    this.store?.set(k, v)
    this.emitter.do(k, v)
    this[effectSymbol].push(() => {
      const storeV = this.store?.get(k)
      if (storeV === v) {
        this.store?.delete(k)
      }
    })
    return this
  }
  upd<T>(k: string, func: (v: T) => T | Promise<T>, effect: (v: T) => T | Promise<T>) {
    const newValue = func(this.store?.get(k))
    this.store?.set(k, newValue)
    this.emitter.do(k, newValue)
    this[effectSymbol].push(() => {
      this.store?.set(k, effect(this.store?.get(k)))
    })
    return this
  }
  del(k: string) {
    const storeV = this.store?.get(k)
    this.store?.delete(k)
    this.emitter.do(k)
    this[effectSymbol].push(() => {
      this.store?.set(k, storeV)
    })
    return this
  }
  get<T>(k: string) {
    return [
      this.store?.get(k) as T,
      this.emitter.on.bind(this.emitter, k)
    ] as const
  }
  use(p: Plugin | (() => Promise<Plugin>) | (() => Promise<{ default: Plugin }>)) {
    let effect: Function

    const childCtx = this.extend()
    function collectPluginEffect(p: Plugin) {
      p.call(childCtx)
      effect = () => {
        childCtx[effectSymbol].forEach(func => func())
      }
    }
    if (typeof p === 'function') {
      const promise = p()
      if (promise instanceof Promise) {
        let isCancel = false
        promise
          .then(plugin => {
            if (isCancel) return
            // let default field prioritize
            if (plugin.default) {
              plugin = plugin.default
            }
            collectPluginEffect(plugin)
          })
        effect = () => {
          isCancel = true
        }
      } else {
        throw new Error('plugin must be a function or a promise')
      }
    } else {
      collectPluginEffect(p)
    }

    // make effect function closure for store this reference
    const wrapEffect = () => effect()
    this[effectSymbol].push(wrapEffect)
    return wrapEffect
  }
  framework<K extends FrameworkKeys>(key: K): Framework<K, PluginName> {
    return new Framework(key, this)
  }
}

export interface Plugin<N extends string = string> {
  name: N
  call: (ctx: Context) => void
}

export function definePlugin(
  name: Plugin['name'],
  call: Plugin['call']
): Plugin {
  return { name, call }
}
