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
    
    // Obter as mãos que já existem no HTML
    const rightHand = document.getElementById('right-hand');
    const leftHand = document.getElementById('left-hand');
    
    if (!rightHand || !leftHand) {
      console.error('Hands not found! Make sure to add #right-hand and #left-hand entities in your HTML');
      return;
    }
    
    // Configurar funcionalidades por mão dominante
    if (dominantHand === 'right') {
      // Destro: mão direita agarra, mão esquerda tem laser
      rightHand.setAttribute('hand-tracking-grab-controls', 'hand: right');
      
      leftHand.setAttribute('oculus-touch-controls', 'hand: left; model: false');
      leftHand.setAttribute('laser-controls', 'hand: left; model: true');
      leftHand.setAttribute('raycaster', 'objects: .clickable');
    } else {
      // Esquerdino: mão esquerda agarra, mão direita tem laser
      leftHand.setAttribute('hand-tracking-grab-controls', 'hand: left');
      
      rightHand.setAttribute('oculus-touch-controls', 'hand: right; model: false');
      rightHand.setAttribute('laser-controls', 'hand: right; model: true');
      rightHand.setAttribute('raycaster', 'objects: .clickable');
    }
    
    console.log('VR hands configured for:', dominantHand === 'right' ? 'right-handed (grab with right)' : 'left-handed (grab with left)');
  }
});
