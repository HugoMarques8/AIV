// Componente para movimento com thumbstick/joystick
AFRAME.registerComponent('thumbstick-movement', {
  schema: {
    speed: { default: 2.0 },
    enabled: { default: true }
  },

  init: function () {
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    // Bind event handlers
    this.onThumbstickMoved = this.onThumbstickMoved.bind(this);
    
    // Listen for thumbstick events on both hands
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    
    if (leftHand) {
      leftHand.addEventListener('thumbstickmoved', this.onThumbstickMoved);
    }
    if (rightHand) {
      rightHand.addEventListener('thumbstickmoved', this.onThumbstickMoved);
    }
    
    console.log('Thumbstick movement component initialized');
  },

  onThumbstickMoved: function (evt) {
    if (!this.data.enabled) return;
    
    // evt.detail.x e evt.detail.y são valores de -1 a 1
    this.velocity.x = evt.detail.x;
    this.velocity.z = -evt.detail.y; // Invertido porque Y do joystick é para frente/trás
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
  }
});
