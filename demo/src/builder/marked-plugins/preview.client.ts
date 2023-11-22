import './preview.client.scss'

document.querySelectorAll<HTMLDivElement>('.zodui-preview')
  .forEach(ele => {
    const {
      schemaEvalKey = '',
      code = ''
    } = ele.dataset
    const originalCode = decodeURIComponent(code)
    emitCode(schemaEvalKey, originalCode)
    const [, evaler] = ele.querySelector('.wrap')!.children
    const drawBar = ele.querySelector('.draw-bar')!
    let isDrawBarVisible = false
    drawBar.querySelector('.icon[data-key="open/close"]')!.addEventListener('click', () => {
      if (isDrawBarVisible) {
        drawBar.classList.remove('display')
      } else {
        drawBar.classList.add('display')
      }
      isDrawBarVisible = !isDrawBarVisible
    })
    drawBar.querySelector('.icon[data-key="Code"]')!.addEventListener('click', () => {
      if (evaler.classList.contains('hidden')) {
        evaler.classList.remove('hidden')
      } else {
        evaler.classList.add('hidden')
      }
    })
    drawBar.querySelector('.icon[data-key="Playground"]')!.addEventListener('click', () => {
      open(`${
        location.origin
      }${
        import.meta.env.BASE_URL
      }play#${
        base64(decodeURIComponent(code), false)
      }`, '_blank')
    })
    drawBar.querySelector('.icon[data-key="StackBlitz"]')!.addEventListener('click', () => {
      // TODO open in StackBlitz
    })
    drawBar.querySelector('.icon[data-key="CodeSandBox"]')!.addEventListener('click', () => {
      // TODO open in CodeSandBox
    })
  })
