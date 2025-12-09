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
    
    // AMBAS as mãos usam oculus-touch-controls (compatível com controladores Meta Quest)
    // A diferença é que a mão do movimento tem laser e raycaster
    // A mão de grab usa o botão grip do controlador
    
    if (dominantHand === 'right') {
      // Destro: mão direita agarra (grip), mão esquerda tem laser e movimento
      rightHand.setAttribute('oculus-touch-controls', 'hand: right');
      rightHand.setAttribute('aabb-collider', 'objects: .grabbable');
      rightHand.setAttribute('grab', '');
      
      leftHand.setAttribute('oculus-touch-controls', 'hand: left');
      leftHand.setAttribute('laser-controls', 'hand: left');
      leftHand.setAttribute('raycaster', 'objects: .clickable; far: 10');
    } else {
      // Esquerdino: mão esquerda agarra (grip), mão direita tem laser e movimento
      leftHand.setAttribute('oculus-touch-controls', 'hand: left');
      leftHand.setAttribute('aabb-collider', 'objects: .grabbable');
      leftHand.setAttribute('grab', '');
      
      rightHand.setAttribute('oculus-touch-controls', 'hand: right');
      rightHand.setAttribute('laser-controls', 'hand: right');
      rightHand.setAttribute('raycaster', 'objects: .clickable; far: 10');
    }
    
    console.log('VR hands configured for:', dominantHand === 'right' ? 'right-handed (right=grip grab, left=laser+movement)' : 'left-handed (left=grip grab, right=laser+movement)');
  }
});
