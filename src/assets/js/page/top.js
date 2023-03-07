'use strict'

import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger);


export default () => {

    const wrapper = document.querySelector('#wrapper');
    if(wrapper) {
        const panels = gsap.utils.toArray('.panel');
        const wrapperWidth = wrapper.offsetWidth;
        /**
        * 横スクロール開始
        */
        gsap.to( panels, {
            xPercent: -100 * (panels.length - 1), // transformX
            ease: "none", // easingの設定
            scrollTrigger: { // scrollTrigger
                trigger: wrapper, // アニメーションの対象となる要素
                pin: true, // 要素を固定する
                scrub: 1, // スクロールとアニメーションを同期させる。数値で秒数の設定に
                // snap: { // スナップスクロールにする
                //     snapTo: 1 / ( panels.length - 1 ), // スナップで移動させる位置
                //     duration: {min: .4, max: .6}, // スナップで移動する際の遅延時間
                //     ease: "none" // easing
                // },
                end: () => "+=" + wrapperWidth // アニメーションの終了タイミング
            }
        })
    }

    // プログレスバー
    const progressBar = document.querySelector('.progress__bar');
    window.addEventListener('scroll', () => {
    const windowYPos = window.pageYOffset;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (windowYPos / height) * 100;
    progressBar.style.width = scrolled + "%";
    });

    // mv 背景画像パララックス
    const mvparallax01 = document.querySelector('.js-mvparallax01');
    const mvparallax02 = document.querySelector('.js-mvparallax02');

     gsap.fromTo(mvparallax01, {
      x: 0,
     }, {
      x: 150, // y方向-に60px移動させる
      ease: "none", // イージングなし
      scrollTrigger: {
       trigger: '#panel01', // ScrollTriggerの開始位置を計算するために使用される要素
       start: "bottom bottom", // 1つ目の値がtriggerで指定した要素の開始位置　2つ目の値が画面の開始位置
       end: "bottom top", // 1つ目の値がtriggerで指定した要素の終了位置　2つ目の値が画面の終了位置
       scrub: 1, // 要素を1秒遅れで追従させる
      }
     });
     gsap.fromTo(mvparallax02, {
        x: 0,
       }, {
        x: 100, // y方向-に60px移動させる
        ease: "none", // イージングなし
        scrollTrigger: {
         trigger: '#panel01', // ScrollTriggerの開始位置を計算するために使用される要素
         start: "bottom bottom", // 1つ目の値がtriggerで指定した要素の開始位置　2つ目の値が画面の開始位置
         end: "bottom top", // 1つ目の値がtriggerで指定した要素の終了位置　2つ目の値が画面の終了位置
         scrub: 1, // 要素を1秒遅れで追従させる
        //  markers: true, // 開始位置、終了位置を調整確認する際に使用します
        }
    }); 

}
