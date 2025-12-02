// Configuração automática de mãos VR baseada na preferência do utilizador
AFRAME.registerComponent('vr-hands', {
  init: function () {
    const scene = this.el.sceneEl;
    
    // Aguardar que a cena esteja carregada
    if (scene.hasLoaded) {
      this.setupHands();
    } else {
      scene.addEventListener('loaded', () => {
        this.setupHands();
      });
    }
  },

  setupHands: function () {
    const dominantHand = localStorage.getItem('dominantHand') || 'right';
    const playerRig = this.el;
    
    // Criar ou configurar mão direita
    let rightHand = document.getElementById('right-hand');
    if (!rightHand) {
      rightHand = document.createElement('a-entity');
      rightHand.setAttribute('id', 'right-hand');
      playerRig.appendChild(rightHand);
    }
    
    // Criar ou configurar mão esquerda
    let leftHand = document.getElementById('left-hand');
    if (!leftHand) {
      leftHand = document.createElement('a-entity');
      leftHand.setAttribute('id', 'left-hand');
      playerRig.appendChild(leftHand);
    }
    
    // Configurar funcionalidades por mão dominante
    if (dominantHand === 'right') {
      // Destro: mão direita agarra, mão esquerda tem laser
      rightHand.setAttribute('hand-controls', 'hand: right; handModelStyle: lowPoly');
      rightHand.setAttribute('hand-tracking-grab-controls', 'hand: right');
      rightHand.setAttribute('raycaster', 'objects: .grabbable; far: 0.1');
      
      leftHand.setAttribute('oculus-touch-controls', 'hand: left');
      leftHand.setAttribute('laser-controls', 'hand: left; model: true');
      leftHand.setAttribute('raycaster', 'objects: .clickable, .grabbable');
    } else {
      // Esquerdino: mão esquerda agarra, mão direita tem laser
      leftHand.setAttribute('oculus-touch-controls', 'hand: left');
      leftHand.setAttribute('hand-controls', 'hand: left; handModelStyle: lowPoly');
      leftHand.setAttribute('hand-tracking-grab-controls', 'hand: left');
      leftHand.setAttribute('raycaster', 'objects: .grabbable; far: 0.1');
      
      rightHand.setAttribute('oculus-touch-controls', 'hand: right');
      rightHand.setAttribute('laser-controls', 'hand: right; model: true');
      rightHand.setAttribute('raycaster', 'objects: .clickable, .grabbable');
    }
    
    console.log('VR hands configured for:', dominantHand === 'right' ? 'right-handed (grab with right)' : 'left-handed (grab with left)');
  }
});
