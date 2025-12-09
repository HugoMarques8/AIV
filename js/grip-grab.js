// Componente para permitir grab com o botão grip dos controladores Oculus
AFRAME.registerComponent('grip-grab', {
  init: function() {
    this.grabbed = null;
    this.gripPressed = false;
    
    // Bind dos event handlers
    this.onGripDown = this.onGripDown.bind(this);
    this.onGripUp = this.onGripUp.bind(this);
    
    // Adicionar listeners para o botão grip
    this.el.addEventListener('gripdown', this.onGripDown);
    this.el.addEventListener('gripup', this.onGripUp);
  },
  
  onGripDown: function() {
    this.gripPressed = true;
    
    // Encontrar o objeto mais próximo que seja grabbable
    const raycaster = this.el.components.raycaster;
    if (raycaster && raycaster.intersections.length > 0) {
      const intersection = raycaster.intersections[0];
      const target = intersection.object.el;
      
      // Verificar se o objeto é grabbable
      if (target && target.classList.contains('grabbable')) {
        this.grabObject(target);
      }
    }
  },
  
  onGripUp: function() {
    this.gripPressed = false;
    
    if (this.grabbed) {
      this.releaseObject();
    }
  },
  
  grabObject: function(object) {
    // Guardar referência ao objeto
    this.grabbed = object;
    
    // Guardar posição e rotação originais
    this.originalPosition = object.getAttribute('position');
    this.originalParent = object.parentNode;
    
    // Anexar o objeto à mão
    this.el.appendChild(object);
    object.setAttribute('position', '0 0 -0.1');
    
    console.log('Grabbed object:', object.id);
  },
  
  releaseObject: function() {
    if (!this.grabbed) return;
    
    // Obter posição global antes de soltar
    const worldPosition = new THREE.Vector3();
    this.grabbed.object3D.getWorldPosition(worldPosition);
    
    // Devolver ao parent original
    this.originalParent.appendChild(this.grabbed);
    
    // Definir posição global
    this.grabbed.setAttribute('position', {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z
    });
    
    console.log('Released object:', this.grabbed.id);
    this.grabbed = null;
  },
  
  remove: function() {
    this.el.removeEventListener('gripdown', this.onGripDown);
    this.el.removeEventListener('gripup', this.onGripUp);
    
    if (this.grabbed) {
      this.releaseObject();
    }
  }
});
