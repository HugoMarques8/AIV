// Componente para movimento com thumbstick/joystick
AFRAME.registerComponent('thumbstick-movement', {
  schema: {
    speed: { default: 2.0 },
    enabled: { default: true }
  },

  init: function () {
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Criar texto de debug visível na VR
    /*
    this.debugText = document.createElement('a-text');
    this.debugText.setAttribute('value', 'Waiting for thumbstick...');
    this.debugText.setAttribute('position', '0 2.5 -2');
    this.debugText.setAttribute('align', 'center');
    this.debugText.setAttribute('color', '#00FF00');
    this.debugText.setAttribute('width', '4');
    this.el.sceneEl.appendChild(this.debugText);
    */
    
    // Bind event handlers
    this.onThumbstickMoved = this.onThumbstickMoved.bind(this);
    
    // Aguardar que as mãos sejam criadas dinamicamente
    this.setupHandListeners();
  },
  
  setupHandListeners: function() {
    // Tentar configurar os listeners
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    
    if (leftHand && rightHand) {
      // Verificar qual mão tem oculus-touch-controls (a mão do laser/movimento)
      const leftHasControls = leftHand.hasAttribute('oculus-touch-controls');
      const rightHasControls = rightHand.hasAttribute('oculus-touch-controls');
      
      if (leftHasControls || rightHasControls) {
        // Só adicionar listener à mão que tem oculus-touch-controls
        if (leftHasControls) {
          leftHand.addEventListener('thumbstickmoved', this.onThumbstickMoved);
          this.updateDebugText('Left hand ready (movement)');
        }
        if (rightHasControls) {
          rightHand.addEventListener('thumbstickmoved', this.onThumbstickMoved);
          this.updateDebugText('Right hand ready (movement)');
        }
      } else {
        // Mãos existem mas ainda não têm controlos, esperar
        this.updateDebugText('Waiting for hand controls...');
        setTimeout(() => this.setupHandListeners(), 100);
      }
    } else {
      // Se as mãos ainda não existem, tentar novamente
      this.updateDebugText('Waiting for hands...');
      setTimeout(() => this.setupHandListeners(), 100);
    }
  },
  
  updateDebugText: function(message) {
    /*
    if (this.debugText) {
      this.debugText.setAttribute('value', message);
    }
    */
  },

  onThumbstickMoved: function (evt) {
    if (!this.data.enabled) return;
    
    // evt.detail.x e evt.detail.y são valores de -1 a 1
    this.velocity.x = evt.detail.x;
    this.velocity.z = evt.detail.y; // Y positivo = para a frente, Y negativo = para trás
    
    // Atualizar texto de debug
    this.updateDebugText(`Thumbstick: X=${evt.detail.x.toFixed(2)} Y=${evt.detail.y.toFixed(2)}`);
  },

  tick: function (time, delta) {
    if (!this.data.enabled || !delta) return;
    
    const el = this.el;
    const data = this.data;
    const velocity = this.velocity;
    
    // Se não há movimento, retorna
    if (velocity.x === 0 && velocity.z === 0) return;
    
    // Pega a direção da câmara
    const camera = document.querySelector('[camera]');
    if (!camera) return;
    
    // Calcula direção baseada na rotação da câmara
    this.direction.set(velocity.x, 0, velocity.z);
    this.direction.applyQuaternion(camera.object3D.quaternion);
    this.direction.y = 0; // Mantém no plano horizontal
    this.direction.normalize();
    
    // Move o player
    const scaledMovement = this.direction.multiplyScalar(data.speed * delta / 1000);
    el.object3D.position.add(scaledMovement);
  },

  remove: function () {
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    
    if (leftHand) {
      leftHand.removeEventListener('thumbstickmoved', this.onThumbstickMoved);
    }
    if (rightHand) {
      rightHand.removeEventListener('thumbstickmoved', this.onThumbstickMoved);
    }
    
    // Remover texto de debug
    /*
    if (this.debugText && this.debugText.parentNode) {
      this.debugText.parentNode.removeChild(this.debugText);
    }
    */
  }
});
