// Componente para permitir grab com o botão squeeze (lateral) dos controladores Oculus
AFRAME.registerComponent('grip-grab', {
  init: function() {
    this.grabbed = null;
    this.squeezePressed = false;
    
    // Criar texto de debug
    this.debugText = document.createElement('a-text');
    this.debugText.setAttribute('value', 'Grip-Grab Ready');
    this.debugText.setAttribute('position', '0 2 -2');
    this.debugText.setAttribute('align', 'center');
    this.debugText.setAttribute('color', '#00FFFF');
    this.debugText.setAttribute('width', '4');
    this.el.sceneEl.appendChild(this.debugText);
    
    // Bind dos event handlers
    this.onSqueezeStart = this.onSqueezeStart.bind(this);
    this.onSqueezeEnd = this.onSqueezeEnd.bind(this);
    
    // Adicionar listeners para o botão grip (lateral/interno do comando)
    // No oculus-touch-controls o botão lateral é 'gripdown'/'gripup'
    this.el.addEventListener('gripdown', this.onSqueezeStart);
    this.el.addEventListener('gripup', this.onSqueezeEnd);
    
    this.updateDebugText('Grip-Grab listening for gripdown...');
  },
  
  updateDebugText: function(message) {
    if (this.debugText) {
      this.debugText.setAttribute('value', message);
    }
  },
  
  onSqueezeStart: function() {
    this.squeezePressed = true;
    this.updateDebugText('Grip pressed!');
    
    // Encontrar o objeto mais próximo que seja grabbable
    const raycaster = this.el.components.raycaster;
    if (!raycaster) {
      this.updateDebugText('No raycaster found!');
      return;
    }
    
    this.updateDebugText('Raycaster intersections: ' + raycaster.intersections.length);
    
    if (raycaster.intersections.length > 0) {
      const intersection = raycaster.intersections[0];
      const target = intersection.object.el;
      
      this.updateDebugText('Target found: ' + (target ? target.id || 'no-id' : 'null'));
      
      // Verificar se o objeto é grabbable
      if (target && target.classList.contains('grabbable')) {
        this.updateDebugText('Grabbing: ' + target.id);
        this.grabObject(target);
      } else {
        this.updateDebugText('Target not grabbable');
      }
    } else {
      this.updateDebugText('No intersections');
    }
  },
  
  onSqueezeEnd: function() {
    this.squeezePressed = false;
    
    if (this.grabbed) {
      this.releaseObject();
    }
  },
  
  grabObject: function(object) {
    // Guardar referência ao objeto
    this.grabbed = object;
    
    // Guardar posição, rotação e escala originais
    this.originalPosition = object.getAttribute('position');
    this.originalRotation = object.getAttribute('rotation');
    this.originalScale = object.getAttribute('scale');
    this.originalParent = object.parentNode;
    
    // Parar animações
    object.removeAttribute('animation__float');
    
    // Anexar o objeto à mão
    this.el.appendChild(object);
    
    // Posicionar na frente do controlador (visível)
    object.setAttribute('position', '0 0.05 -0.15');
    object.setAttribute('rotation', '0 0 0');
    
    this.updateDebugText('GRABBED: ' + object.id);
    console.log('Grabbed object:', object.id);
  },
  
  releaseObject: function() {
    if (!this.grabbed) return;
    
    // Obter posição global antes de soltar
    const worldPosition = new THREE.Vector3();
    const worldRotation = new THREE.Euler();
    this.grabbed.object3D.getWorldPosition(worldPosition);
    this.grabbed.object3D.getWorldQuaternion(new THREE.Quaternion());
    
    // Devolver ao parent original
    this.originalParent.appendChild(this.grabbed);
    
    // Definir posição global
    this.grabbed.setAttribute('position', {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z
    });
    
    // Restaurar rotação e escala originais
    this.grabbed.setAttribute('rotation', this.originalRotation);
    this.grabbed.setAttribute('scale', this.originalScale);
    
    this.updateDebugText('RELEASED: ' + this.grabbed.id);
    console.log('Released object:', this.grabbed.id);
    this.grabbed = null;
  },
  
  remove: function() {
    this.el.removeEventListener('gripdown', this.onSqueezeStart);
    this.el.removeEventListener('gripup', this.onSqueezeEnd);
    
    if (this.grabbed) {
      this.releaseObject();
    }
  }
});
