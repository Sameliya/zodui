// TODO use to import zodui external by `zodui/external`
const DEFAULT_CODE = `import * as z from 'zod'

export default z
  .object({
    foo: z.string(),
    bar: z.number().mode('split')
  })
  .label('Object')
  .describe('This is a Object Configuration')
`

const BORDER_SIZE = 4

const editors: Record<string, monaco.editor.IStandaloneCodeEditor> = {}

const codeChangeListeners: Record<string, Function[]> = {}

window.onCodeChange = function (key, fn) {
  if (!codeChangeListeners[key]) {
    codeChangeListeners[key] = []
  }
  const curCodeChangeListeners = codeChangeListeners[key]
  curCodeChangeListeners.push(fn)

  fn(editors[key]?.getValue() ?? DEFAULT_CODE)

  const index = curCodeChangeListeners.length - 1
  return () => {
    if (index > -1) curCodeChangeListeners.splice(index, 1)
  }
}

document.querySelectorAll<HTMLDivElement>('.monaco-editor')
  .forEach(el => {
    const { key = '', byHash = false, enableHistory = false } = el.dataset

    let editor: monaco.editor.IStandaloneCodeEditor

    window.onThemeChange(theme => {
      if (editor) {
        monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs')
      } else {
        let i = setInterval(() => {
          if (editor) {
            monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs')
            clearInterval(i)
          }
        }, 100)
      }
    })

    function updateCode(s: string) {
      let i = setInterval(() => {
        if (codeChangeListeners[key]) {
          codeChangeListeners[key].forEach((fn) => fn(s))
          clearInterval(i)
        }
      }, 100)
    }

    editor = monaco.editor.create(el, {
      theme: window.theme === 'dark' ? 'vs-dark' : 'vs',
      value: DEFAULT_CODE,
      language: 'typescript',
      tabSize: 2,
      automaticLayout: true,
      model: monaco.editor.createModel('', 'typescript', monaco.Uri.parse(`file:///${key ?? 'main'}.ts`)),
    })
    editors[key] = editor

    if (byHash) {
      function setCodeByUrl() {
        const hash = location.hash.slice(1)
        const code = hash ? base64(hash) : DEFAULT_CODE
        editor.setValue(code)
        updateCode(code)
      }

      window.addEventListener('hashchange', setCodeByUrl)

      setCodeByUrl()
    }

    // add custom dts
    monaco.languages.typescript.typescriptDefaults.setExtraLibs(
      MONACO_DTS_FILES
    )

    const historyCodes: { code: string }[] = []
    let historyIndex = -1
    // watch editor value change
    editor.onDidChangeModelContent(debounce(function () {
      updateCode(editor.getValue())
    }, 1500))
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const code = editor.getValue()
      updateCode(code)
      if (byHash) {
        // save code to hash
        location.hash = `#${base64(code, false)}`
        // copy url to clipboard
        copyToClipboard(location.href)
        showMessage('<h3 style="margin: 0">url copied to clipboard, share it with your friends!</h3>')
      }
    })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow, function () {
      if (historyIndex === -1) {
        historyIndex = historyCodes.length - 1
      } else {
        historyIndex--
      }
      if (historyIndex < 0) {
        historyIndex = 0
      }
      editor.setValue(historyCodes[historyIndex].code)
    })
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow, function () {
      if (historyIndex === -1) {
        historyIndex = historyCodes.length - 1
      } else {
        historyIndex++
      }
      if (historyIndex >= historyCodes.length) {
        historyIndex = historyCodes.length - 1
      }
      editor.setValue(historyCodes[historyIndex].code)
    })
    editor.focus()

    let mPos: number
    function resize(e: MouseEvent) {
      const dx = e.x - mPos
      const newWidth = (parseInt(getComputedStyle(el, '').width) + dx)

      mPos = e.x
      el.style.width = newWidth + 'px'
      el.style.minWidth = '5px'
    }

    let isClick = false
    el.addEventListener('mousedown', e => {
      if (e.offsetX > el.offsetWidth - BORDER_SIZE) {
        mPos = e.x
        if (!isClick) {
          isClick = true
          setTimeout(() => isClick = false, 1000)
        } else {
          el.style.width = '500px'
        }
        document.addEventListener('mousemove', resize, false)
        el.style.userSelect = 'none'
      }
    }, false)
    document.addEventListener('mouseup', () => {
      el.style.userSelect = 'auto'
      document.removeEventListener('mousemove', resize, false)
    })
  })
