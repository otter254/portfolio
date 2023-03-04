'use strict'

import Swiper, { Navigation, Pagination, Autoplay } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const Slideshow = () => {

  const option = {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    slidesPerView: 1,
    speed: 1000,
    autoplay: {
      delay: 5000,
    },
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  }

  const swiper = new Swiper('.swiper', option)
}
export default Slideshow