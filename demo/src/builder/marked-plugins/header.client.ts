import './header.client.scss'

const main = document.querySelector<HTMLDivElement>('body > main')
const menu = document.querySelector('ul.menu')
let menuItem: HTMLLIElement | null = null

const hash = location.hash ? decodeURIComponent(location.hash) : null

document.querySelectorAll<HTMLDivElement>('.anchor-point')
  .forEach(e => {
    const id = e.id
    if (hash && id === hash.slice(1)) {
      const newMenuItem = menu.querySelector(`a[href="${hash}"]`).parentElement as HTMLLIElement
      if (newMenuItem) {
        newMenuItem.classList.add('active')
        menuItem = newMenuItem
      }
      document.querySelector(hash)?.scrollIntoView()
    }
  })

function throttle<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let last = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - last > delay) {
      fn(...args)
      last = now
    }
  }
}

main.addEventListener('scroll', throttle(() => {
  const anchors = document.querySelectorAll<HTMLDivElement>('.anchor-point')
  let activeAnchor: HTMLDivElement | null = null
  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i]
    const rect = anchor.getBoundingClientRect()
    if (rect.top < 124) {
      activeAnchor = anchor
    } else {
      break
    }
  }
  if (!activeAnchor) return
  const id = activeAnchor.id
  const newMenuItem = menu.querySelector(`a[href="#${id}"]`)?.parentElement as HTMLLIElement
  if (!newMenuItem) return
  menuItem?.classList.remove('active')
  newMenuItem.classList.add('active')
  menuItem = newMenuItem
}, 100))
