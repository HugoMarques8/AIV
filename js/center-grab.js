AFRAME.registerComponent('center-grab', {
  init: function () {
    this.initialPosition = this.el.object3D.position.clone();
    this.el.addEventListener('grab-start', this.onGrabStart.bind(this));
    this.el.addEventListener('grab-end', this.onGrabEnd.bind(this));
  },
  onGrabStart: function (evt) {
    // Move o cubo para o centro da mão
    var hand = evt.detail.hand;
    if (hand && hand.object3D) {
      this.el.object3D.position.set(0, 0, 0);
      hand.object3D.add(this.el.object3D);
    }
  },
  onGrabEnd: function () {
    // Remove do hand e volta à posição inicial
    this.el.sceneEl.object3D.add(this.el.object3D);
    this.el.object3D.position.copy(this.initialPosition);
  }
});
