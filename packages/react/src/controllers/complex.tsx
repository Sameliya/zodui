import type { ZodUnionOptions } from 'zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, ControllerProps } from './index'
import { AllTypes, Mutable, TypeMap, useModes } from '../utils'

import '../plugins/common-complex'
import { plgMaster } from '../plugins'
import { useItemSerterContext } from '../contexts/item-serter'
import { Schema } from '../schema'
import { Select } from '../components'
import { BaseCompProps } from '../components/base'

function resolveSchemas(schemas: ZodUnionOptions): BaseCompProps.SelectOptions[] {
  // TODO resolve not literal type, it not contain value
  return schemas.map((schema, index) => ({
    label: schema._def.label || schema._def.description || schema._def.value || `[${index}]`,
    title: schema._def.description,
    value: index
  }))
}

const innerComplexTypes = [
  AllTypes.ZodUnion
] as const

export const complex = innerComplexTypes as Mutable<typeof innerComplexTypes>

export type ComplexType = (typeof complex)[number]

export function Complex({
  schema,
  value,
  defaultValue,
  ...rest
}: ControllerProps<TypeMap[ComplexType]>) {
  const options = useMemo(() => resolveSchemas(schema.options), [schema.options])
  const [index, setIndex] = useState<number>(0)
  useEffect(() => {
    const v = value ?? defaultValue
    const index = schema.options.findIndex(schema => schema._def.value === v)
    if (index === -1) return

    setIndex(index)
  }, [value, defaultValue])
  const props = {
    title: schema._def.description,
    ...rest,
    value: index,
    onChange(v: any) {
      setIndex(v)
      rest.onChange?.(schema.options[v]._def.value)
    }
  }
  const modes = useModes(schema)

  const ItemSerter = useItemSerterContext()

  const OptionRender = <>
    <ItemSerter.Append deps={[schema.options, index]}>
      {/* 在里面控制是因为在 modes 修改后，将 append 内容清空 */}
      {modes.includes('append') && schema.options[index]._def.typeName !== AllTypes.ZodLiteral
        && <Schema model={schema.options[index]} />}
    </ItemSerter.Append>
    {!modes.includes('append') && schema.options[index]._def.typeName !== AllTypes.ZodLiteral && <>
      <br/>
      <Controller
        schema={schema.options[index]}
        {...rest}
      />
    </>}
  </>

  const targetPlgs = plgMaster.plgs[schema._def.typeName]
  for (const { componentMatchers } of targetPlgs) {
    for (const compMatcher of componentMatchers) {
      if (compMatcher.is(modes))
        return <compMatcher.Component
          modes={modes}
          schema={schema}
          options={options}
          OptionRender={OptionRender}
          {...props}
        />
    }
  }

  // TODO support `'' | (string & {})` type
  //      display select input
  return <>
    <Select
      options={options}
      {...props}
    />
    {OptionRender}
  </>
}
