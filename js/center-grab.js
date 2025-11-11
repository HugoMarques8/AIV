AFRAME.registerComponent('center-grab', {
  init: function () {
    this.initialPosition = this.el.getAttribute('position');
    this.el.addEventListener('grab-end', () => {
      this.el.setAttribute('position', this.initialPosition);
    });
  }
});
