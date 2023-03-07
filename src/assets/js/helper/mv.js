'use strict'
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger);

export default () => {
    // ——————————————————————————————————————————————————
    // TextScramble
    // ——————————————————————————————————————————————————

    class TextScramble {
      constructor(el) {
        this.el = el
        this.chars = '!<>-_\\/[]{}—=+*^?#________'
        this.update = this.update.bind(this)
      }
      setText(newText) {
        const oldText = this.el.innerText
        const length = Math.max(oldText.length, newText.length)
        const promise = new Promise((resolve) => this.resolve = resolve)
        this.queue = []
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || ''
          const to = newText[i] || ''
          const start = Math.floor(Math.random() * 40)
          const end = start + Math.floor(Math.random() * 40)
          this.queue.push({ from, to, start, end })
        }
        cancelAnimationFrame(this.frameRequest)
        this.frame = 0
        this.update()
        return promise
      }
      update() {
        let output = ''
        let complete = 0
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i]
          if (this.frame >= end) {
            complete++
            output += to
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar()
              this.queue[i].char = char
            }
            output += `<span class="dud">${char}</span>`
          } else {
            output += from
          }
        }
        this.el.innerHTML = output
        if (complete === this.queue.length) {
          this.resolve()
        } else {
          this.frameRequest = requestAnimationFrame(this.update)
          this.frame++
        }
      }
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)]
      }
    }

    setTimeout(() => {
      const el = document.querySelector('.mvtext')
      const fx = new TextScramble(el)
      fx.setText('CREATE')
  
      const el02 = document.querySelector('.mvtext02')
      const fx02 = new TextScramble(el02)
      fx02.setText('species')
    }, 700);

    setTimeout(() => {
      const tl = gsap.timeline();
      tl.add(gsap.to("#js-mvbglayer", { opacity:0, duration: 1 }));
      tl.add(gsap.to("#js-mvfade01", { opacity:1, y:0}, "+=0.3"));
      tl.add(gsap.to("#js-mvfade02", { opacity:1, y:0}, "+=0.1"));
      tl.add(gsap.to("#js-mvfade03", { opacity:1, y:0}, "+=0.1"));
      tl.add(gsap.to("#js-progress", { opacity:1 , duration:1,}, "+=0.1"));
    }, 2500);
}
