'use strict'

export default () => {
  const modalWrapper = document.querySelector('.modal-wrapper');
  const images = document.querySelectorAll('.js-image');
  const modalImage = document.querySelector('.modal-image');
  const modalText = document.getElementById('modal-txt')
     
  images.forEach(function(image) {
       image.addEventListener('click', function() {
            //テキスト中をリセット
            modalText.innerText = "";
            
            modalWrapper.classList.add('show');
            modalImage.classList.add('show');
  
            let imageSrc = image.getAttribute('src');
            modalImage.src = imageSrc;

            //   data-src があれば表示
            if (image.hasAttribute('data-src')) {
               let imageText = image.getAttribute('data-src');
               modalText.innerText = "制作時間" + imageText;
            } else {
            }
       });
  });
  
  modalWrapper.addEventListener('click', function() {
       if (this.classList.contains('show')) {
            this.classList.remove('show');
            modalImage.classList.remove('show');
       }
  });
}
