'use strict'

export default () => {
  const modalWrapper = document.querySelector('.modal-wrapper');
  const images = document.querySelectorAll('.image');
  const modalImage = document.querySelector('.modal-image');
  const modalText = document.getElementById('modal-txt')

  images.forEach(function(image) {
       image.addEventListener('click', function() {
            modalWrapper.classList.add('show');
            modalImage.classList.add('show');
  
            let imageSrc = image.getAttribute('src');
            let imageText = image.getAttribute('data-src');
            modalImage.src = imageSrc;
            modalText.innerText = "制作時間" + imageText;
       });
  });
  
  modalWrapper.addEventListener('click', function() {
       if (this.classList.contains('show')) {
            this.classList.remove('show');
            modalImage.classList.remove('show');
       }
  });
}
