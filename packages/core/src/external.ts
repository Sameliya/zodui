import type { ModesMap } from '@zodui/core'
import type { Schema, ZodDefaultDef, ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import * as z from 'zod'

declare module 'zod' {
  export interface ZodTypeDef {
    mode: string
    label: string
  }
  export interface ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _mode: string
    // TODO support generic
    // mode<T extends string>(
    mode(
      mode:
        | Def extends ZodDefaultDef<infer InnerT extends ZodTypeAny>
          ? ModesMap[InnerT['_def']['typeName']]
          // @ts-ignore
          : ModesMap[Def['typeName']]
        | (string & {})
    ): ZodType<Output, Def, Input>

    readonly _label: string
    label(mode: string): ZodType<Output, Def, Input>

    readonly type: string
  }
  export function clazz<T>(clazz: { new(): T }): Schema<T>
  export function asObject<T>(t: T): ZodObject<Record<string, ZodTypeAny> & T>
  // TODO resolve default type
}

function defineMetaField(key: string) {
  try {
    !Object.hasOwn(z.ZodType.prototype, `_${key}`)
      && Object.defineProperty(z.ZodType.prototype, `_${key}`, {
        get() {
          return this._def[key]
        }
      })
    !Object.hasOwn(z.ZodType.prototype, key)
      && Object.defineProperty(z.ZodType.prototype, key, {
        get() {
          return (val: any) => {
            const This = (this as any).constructor
            return new This({
              ...this._def,
              [key]: val
            })
          }
        }
      })
  } catch (e) {
    console.error(e)
  }
}

defineMetaField('mode')
defineMetaField('label')

!Object.hasOwn(z.ZodType.prototype, 'type')
  && Object.defineProperty(z.ZodType.prototype, 'type', {
    get() {
      return this._def
        ?.typeName
        .replace('Zod', '')
        .toLowerCase()
        ?? 'unknown'
    }
  })

const nz = { ...z } as typeof z

export default nz

export function clazz<T extends ZodRawShape>(clazz: { new(): T }): Schema<T> {
  return z.object(new clazz()) as any
}
// @ts-ignore
nz.clazz = clazz

export function asObject<T extends ZodRawShape>(t: T): ZodObject<Record<string, ZodTypeAny> & T> {
  return z.object(t) as any
}
// @ts-ignore
nz.asObject = asObject

export { nz as z }

export * from 'zod'
