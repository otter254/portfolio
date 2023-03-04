'use strict'

// 横スクロール可能な要素にヒントを表示する
export default () => {
  const header = document.querySelector('.l-header')
  window.addEventListener('scroll', () => {
    header.style.left = -window.pageXOffset + 'px'
  })
}
