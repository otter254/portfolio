'use strict'

import EL from '../constant/elements'


export default () => {
    const targetElement = document.querySelectorAll(".js-fadeIn");
    document.addEventListener("scroll", function() {
    for (let i = 0; i < targetElement.length; i++) {
        const getElementDistance = targetElement[i]
        .getBoundingClientRect().top + targetElement[i].clientHeight * .2
        if (window.innerHeight > getElementDistance) {
        targetElement[i].classList.add("show")
        }
    }
    });
}
