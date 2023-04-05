'use strict'

import EL from '../constant/elements'
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger);
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);


export default () => {

    const mediaQuery = window.matchMedia('(min-width: 1025px)');
 
    // ページが読み込まれた時に実行
    handle(mediaQuery);
    
    // ウィンドウサイズを変更しても実行（ブレイクポイントの監視）
    mediaQuery.addListener(handle);
    
    function handle(mm) {
    if (mm.matches) {
        const wrapper = document.querySelector('#wrapper');
        if(wrapper) {
            const panels = gsap.utils.toArray('.panel');
            const wrapperWidth = wrapper.offsetWidth;
        
            let scrollTween = gsap.to( panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                animation: scrollTween,
                scrollTrigger: {
                    trigger: wrapper,
                    pin: true,
                    scrub: 1,
                    // snap: { // スナップスクロールにする
                    //     snapTo: 1 / ( panels.length - 1 ), // スナップで移動させる位置
                    //     duration: {min: .4, max: .6}, // スナップで移動する際の遅延時間
                    //     ease: "none" // easing
                    // },
                    end: () => "+=" + wrapperWidth // アニメーションの終了タイミング
                }
            })
    
            // アンカーリンク
            const anchors = document.querySelectorAll(".anchor");
            let index = '';
            anchors.forEach( (anchor) => {
                anchor.addEventListener( 'click', (e) => {
                    e.preventDefault();
                    index = [].slice.call(anchors).indexOf(anchor); // 何番目のアンカーリンクをクリックしたか取得
                    const target = document.querySelector(e.currentTarget.querySelector('a').getAttribute('href')); // クリックしたアンカーリンクに紐づくpanelを取得
                    const scrollbarWidth = window.innerWidth - document.body.clientWidth; // スクロールバーの長さを取得
                    const wrapperOffset = target.offsetLeft * ( wrapper.clientWidth / ( wrapper.clientWidth - window.innerWidth ) ) + scrollbarWidth * index; // 移動位置を取得
                    gsap.to(window, {
                        scrollTo: {
                            y: wrapperOffset,
                            autoKill: false
                        },
                        duration: 1
                    });
                });
            });
    
            // 画像 fade in 下から
            const images = document.querySelectorAll('.js-fadeup')
            images.forEach(el => {
                gsap.from(el, 
                {
                    autoAlpha: 0,
                    y: 100,
                    scrollTrigger: {
                        trigger: el,
                        start: "right right",
                        end: "right 70%",
                        scrub: 1,
                        // markers:true,
                        containerAnimation:scrollTween,
                    },
                });
            });
    
            // テキスト blur
            const blurs = document.querySelectorAll('.js-blur')
            blurs.forEach(el => {
                gsap.from(el, 
                {
                    scrollTrigger: {
                        trigger: el,
                        start: "left right",
                        scrub: 1,
                        // markers:true,
                        containerAnimation:scrollTween,
                        toggleClass: {targets: el, className: "is-active"},
                    },
                });
            });
    
            // 背景色反転エリア
            const reversal = document.querySelector('.js-reversal')
            gsap.from(reversal, 
                {
                    ease: "none",
                    opacity:1,
                    scrollTrigger: {
                     trigger: reversal,
                     start: "left 70%",
                     end: "right -50%",
                     scrub: 1,
                     containerAnimation:scrollTween,
                    //  markers: true,
                     toggleClass: {targets: EL.BODY , className: "is-active"},
                    },
                });
    
            // エトセトラエリア
            const etcimages = document.querySelectorAll('.js-etcimg')
            etcimages.forEach(el => {
                // gsap.set(el, {y:-500})
                gsap.from(el, 
                {
                    y: 500,
                    scrollTrigger: {
                        trigger: ".top-etc",
                        start: "left right",
                        end: "right left",
                        scrub: 1,
                        containerAnimation:scrollTween,
                    },
                });
            });
            gsap.from(".js-etcimg02", 
                {
                    y: -500,
                    scrollTrigger: {
                        trigger: ".top-etc",
                        start: "left right",
                        end: "right left",
                        scrub: 1,
                        containerAnimation:scrollTween,
                    },
            });
    
            // SNS fadein
            gsap.set("#js-sns01", { y: 30, autoAlpha: 0});
            gsap.set("#js-sns02", { y: 30, autoAlpha: 0});
            gsap.set("#js-sns03", { y: 30, autoAlpha: 0});
            gsap.timeline({
                defaults: {
                  duration: 1,
                  ease: "easeInOut"
                },
              
                scrollTrigger: {
                  trigger: "#js-snstrigger",
                  start: "left right",
                  toggleActions: "play none none reset",
                  containerAnimation:scrollTween,
                //   markers: true,
                }
              })
            .to("#js-sns01", { y: 0, autoAlpha: 1 ,duration: .8 })
            .to("#js-sns02", { y: 0, autoAlpha: 1 ,duration: .8 }, "-=.5")
            .to("#js-sns03", { y: 0, autoAlpha: 1 ,duration: .8 }, "-=.5")
        }

            // mv 背景画像パララックス
        const mvparallax01 = document.querySelector('.js-mvparallax01');
        const mvparallax02 = document.querySelector('.js-mvparallax02');
        const mvparallax03 = document.querySelector('.top-mv__title');

        gsap.fromTo(mvparallax01, {
        x: 0,
        }, {
        x: 150, 
        ease: "none",
        scrollTrigger: {
        trigger: '#panel01',
        start: "bottom bottom",
        end: "bottom top",
        scrub: 1,
        }
        });
        gsap.fromTo(mvparallax02, {
            x: 0,
        }, {
            x: 100, 
            ease: "none",
            scrollTrigger: {
            trigger: '#panel01',
            start: "bottom bottom",
            end: "bottom top",
            scrub: 1,
            //  markers: true,
            }
        });
        gsap.fromTo(mvparallax03, {
            x: 0,
        }, {
            x: 200, 
            ease: "none",
            scrollTrigger: {
            trigger: '#panel01',
            start: "bottom bottom",
            end: "bottom top",
            scrub: 1,
            //  markers: true,
            }
        });

    } else {
        // それ以外の処理

        // テキスト blur
        const blurs = document.querySelectorAll('.js-blur')
        blurs.forEach(el => {
            gsap.from(el, 
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                    // markers:true,
                    toggleClass: {targets: el, className: "is-active"},
                },
            });
        });
    }
    }

    // プログレスバー
    const progressBar = document.querySelector('.progress__bar');
    window.addEventListener('scroll', () => {
    const windowYPos = window.pageYOffset;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (windowYPos / height) * 100;
    progressBar.style.width = scrolled + "%";
    });


}
