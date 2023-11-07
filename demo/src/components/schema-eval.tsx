import React from 'react'
import ReactDOM from 'react-dom'

import { Demo } from './schema-eval.react'

document.querySelectorAll<HTMLDivElement>('.schema-eval-container')
  .forEach(el => {
    const { key = '', code, configure = '{}' } = el.dataset
    const configureObj = configure ? JSON.parse(configure) : undefined

    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(<React.StrictMode>
      <Demo k={key} c={code} configure={configureObj} />
    </React.StrictMode>, el)
  })
