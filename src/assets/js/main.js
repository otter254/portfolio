'use strict'

// babel polyfill
import 'core-js/stable'

// define
import EL from './constant/elements'

// helper
import hmb from './helper/hmb'
import uaDataset from './helper/uaDataset'
import sweetScrollInit from './helper/sweetScrollInit'
import getTouchSupport from './helper/getTouchSupport'
import getDocumentH from './helper/getDocumentHeight'
import getOrientation from './helper/getOrientation'
import getClassName from './helper/getClassName'
import set100vh from './helper/set100vh'
import swiper from './helper/swiper'
import headerFixed from './helper/headerFixed'

// plugins
import { throttle, debounce } from 'throttle-debounce'

// page scripts
import pageNameTop from './page/top'

// require
require('intersection-observer')
require('focus-visible')
require('matchheight')
require('svgxuse')

// ua
let ua = null

// className
let className = null

// lastInnerWidth
let lastInnerWidth = window.innerWidth

// innerHeight
let innerHeight = window.innerHeight

// isPopStateEvent
let isPopStateEvent = false

/**
 * getScrollPos
 */
const getScrollPos = () => {
  const y = Math.round(window.pageYOffset)
  const offset = className === 'top' ? innerHeight : 200
  const documentH = getDocumentH()

  // add class is-scroll
  if (y > 0) {
    if (!EL.HTML.classList.contains('is-scroll')) {
      EL.HTML.classList.add('is-scroll')
    }
  } else {
    EL.HTML.classList.remove('is-scroll')
  }

  // add class is-footer
  if (documentH <= y) {
    if (!EL.HTML.classList.contains('is-footer')) {
      EL.HTML.classList.add('is-footer')
    }
  } else {
    EL.HTML.classList.remove('is-footer')
  }
}

/**
 * resize
 */
const resize = () => {
  // set100vh（常に更新）
  set100vh('--vh-always')

  // window高さが高くなった時
  if (window.innerHeight > innerHeight) {
    set100vh('--vh-max')
  }

  // window幅が変わった時
  if (lastInnerWidth !== window.innerWidth) {
    lastInnerWidth = window.innerWidth

    // set100vh
    set100vh()
  }

  innerHeight = window.innerHeight
}

/**
 * firstRun
 */
const firstRun = () => {
  // set ua dataset
  ua = uaDataset()

  // set touch support dataset
  ua.touchsupport = getTouchSupport()

  // getOrientation
  getOrientation()

  // set100vh
  set100vh()

  // set100vh（常に更新）
  set100vh('--vh-always')

  headerFixed()
}

/**
 * initOnce
 */
const initOnce = () => {
  // sweetScroll
  sweetScrollInit()

  // hmb menu
  hmb()

  // swiper
  swiper()
}

/**
 * initRun
 */
const initRun = () => {
  // set100vh
  set100vh()

  // set100vh（常に更新）
  set100vh('--vh-always')

  // get body className
  className = getClassName(EL.BODY)

  // getScrollPos
  getScrollPos()

  // top
  if (className.endsWith('top')) pageNameTop()

  EL.HTML.classList.add('is-loaded')
}

/**
 * DOMCONTENTLOADED
 */
window.addEventListener('DOMContentLoaded', firstRun)

/**
* LOAD
*/
window.addEventListener('load', initOnce)
window.addEventListener('load', initRun)

/**
* SCROLL
*/
window.addEventListener('scroll', throttle(100, getScrollPos), false)

/**
* RESIZE
*/
window.addEventListener('resize', debounce(50, resize), false)
