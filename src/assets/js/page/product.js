'use strict'

import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger);

export default () => {
    setTimeout(() => {
        const tl = gsap.timeline({
          defaults: {
            ease: "none"
          },
        });
        tl.add(gsap.to("#js-mvfade01", { opacity:1, y:0}));
        tl.add(gsap.to("#js-mvfade02", { opacity:1, y:0}));
        tl.add(gsap.to("#js-mvfade03", { opacity:1, y:0}, "+=0.1"));
        tl.add(gsap.to("#js-mvfade04", { opacity:1, y:0}, "+=0.1"));
        tl.add(gsap.to("#js-mvfade05", { opacity:1, y:0}));
      }, 500);

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
