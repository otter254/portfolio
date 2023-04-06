'use strict'

import EL from '../constant/elements'
import getDeviceType from './getDeviceType'
import { throttle, debounce } from 'throttle-debounce'

/**
 * ハンバーガーメニューの動作制御
 * オープン：ハンバーガーメニューのクリック
 * クローズ：ハンバーガーメニューのクリック、背景レイヤーのクリック
 */
export default () => {
  const func = {
    isActive: false,
    deviceType: getDeviceType(),

    HMB: document.querySelector('.js-hmb'),
    MEGNAV: document.querySelector('.l-nav__mega'),

    /**
     * init
     */
    init: () => {
      if (func.HMB) func.HMB.addEventListener('click', func.switchShowHide, false)
      if (func.MEGNAV) func.MEGNAV.addEventListener('click', func.switchShowHide, false)
      window.addEventListener('resize', func.resize, false)
    },

    /**
     * show
     */
    show: () => {
      func.isActive = true
      EL.HTML.classList.add('is-nav-active')
    },

    /**
     * hide
     */
    hide: () => {
      func.isActive = false
      EL.HTML.classList.remove('is-nav-active')
    },

    /**
     * switchShowHide
     */
    switchShowHide: () => {
      func.isActive ? func.hide() : func.show()
    },

    /**
     * resize
     */
    resize: debounce(150, () => {
      if (func.deviceType !== getDeviceType()) {
        func.deviceType = getDeviceType()
        func.hide()
      }
    })
  }

  func.init()
}
