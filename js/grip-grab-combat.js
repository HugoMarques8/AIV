// Componente para permitir grab com o botão squeeze (lateral) dos controladores Oculus
AFRAME.registerComponent('grip-grab', {
  init: function() {
    this.grabbed = null;
    this.squeezePressed = false;
    
    // Criar linha curta visual (0.5m) para mostrar direção de grab
    this.grabLine = document.createElement('a-entity');
    this.grabLine.setAttribute('line', {
      start: '0 0.005 -0.025',
      end: '0 0.005 -0.525',
      color: '#FF0000',
      opacity: 0.6,
    });
    this.el.appendChild(this.grabLine);
    
    // Criar texto de debug
    /*
    this.debugText = document.createElement('a-text');
    this.debugText.setAttribute('value', 'Grip-Grab Ready');
    this.debugText.setAttribute('position', '0 2 -2');
    this.debugText.setAttribute('align', 'center');
    this.debugText.setAttribute('color', '#00FFFF');
    this.debugText.setAttribute('width', '4');
    this.el.sceneEl.appendChild(this.debugText);
    */
    
    // Bind dos event handlers
    this.onSqueezeStart = this.onSqueezeStart.bind(this);
    this.onSqueezeEnd = this.onSqueezeEnd.bind(this);
    
    // Adicionar listeners para o botão grip (lateral/interno do comando)
    // No oculus-touch-controls o botão lateral é 'gripdown'/'gripup'
    this.el.addEventListener('gripdown', this.onSqueezeStart);
    this.el.addEventListener('gripup', this.onSqueezeEnd);
    
    // this.updateDebugText('Grip-Grab listening for gripdown...');
  },
  
  updateDebugText: function(message) {
    /*
    if (this.debugText) {
      this.debugText.setAttribute('value', message);
    }
    */
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
    
    // Guardar escala original
    this.originalScale = object.getAttribute('scale');
    
    // Parar animações
    object.removeAttribute('animation__float');
    
    // NÃO anexar como filho - apenas marcar como grabbed
    // Calcular offsets de posição e rotação em relação à mão
    this.handPosition = new THREE.Vector3();
    this.handQuaternion = new THREE.Quaternion();
    this.objectPosition = new THREE.Vector3();
    this.objectQuaternion = new THREE.Quaternion();
    this.relativeOffset = new THREE.Vector3();
    this.rotationOffset = new THREE.Quaternion();
    
    this.el.object3D.getWorldPosition(this.handPosition);
    this.el.object3D.getWorldQuaternion(this.handQuaternion);
    object.object3D.getWorldPosition(this.objectPosition);
    object.object3D.getWorldQuaternion(this.objectQuaternion);
    
    // Offset de posição salvo no espaço da mão
    const handInverse = this.handQuaternion.clone().invert();
    this.relativeOffset.copy(this.objectPosition).sub(this.handPosition).applyQuaternion(handInverse);
    
    // Offset de rotação entre mão e objeto
    this.rotationOffset.copy(handInverse).multiply(this.objectQuaternion);
    
    this.updateDebugText('GRABBED: ' + object.id);
    console.log('Grabbed object:', object.id);
  },
  
  tick: function() {
    if (!this.grabbed) return;
    
    // Atualizar posição e rotação da mão
    const handQuat = this.handQuaternion; // reutilizar instância para evitar alocações
    this.el.object3D.getWorldPosition(this.handPosition);
    this.el.object3D.getWorldQuaternion(handQuat);
    
    // Calcular nova posição do objeto preservando offset relativo
    const worldOffset = this.relativeOffset.clone().applyQuaternion(handQuat);
    const newPos = this.handPosition.clone().add(worldOffset);
    this.grabbed.setAttribute('position', newPos);
    
    // Calcular nova rotação do objeto preservando offset relativo
    const desiredQuat = handQuat.clone().multiply(this.rotationOffset);
    this.grabbed.object3D.quaternion.copy(desiredQuat);
    
    // Atualizar rotação no atributo para manter consistência com A-Frame
    const euler = new THREE.Euler().setFromQuaternion(desiredQuat, 'YXZ');
    this.grabbed.setAttribute('rotation', {
      x: THREE.MathUtils.radToDeg(euler.x),
      y: THREE.MathUtils.radToDeg(euler.y),
      z: THREE.MathUtils.radToDeg(euler.z)
    });
    
    // Atualizar matriz do objeto
    this.grabbed.object3D.updateMatrixWorld(true);
  },

  releaseObject: function() {
    if (!this.grabbed) return;
    
    // Obter posição atual
    const currentPos = this.grabbed.getAttribute('position');
    const releasePos = 'x:' + currentPos.x.toFixed(1) + ' y:' + currentPos.y.toFixed(1) + ' z:' + currentPos.z.toFixed(1);
    this.updateDebugText('RELEASED at ' + releasePos);
    
    // Restaurar escala original
    this.grabbed.setAttribute('scale', this.originalScale);
    
    console.log('Released object:', this.grabbed.id, 'at', releasePos);

    // Emitir evento customizado para sinalizar que o objeto foi solto
    // Isso permite que listeners externos (ex.: exchange-zone) detectem a ação
    try {
      // Emitir com bubble para alcançar listeners no elemento pai (p.ex. entidade que possui o id)
      if (this.grabbed.emit) {
        this.grabbed.emit('onSqueezeEnd', null, true);
      } else {
        this.grabbed.dispatchEvent(new CustomEvent('onSqueezeEnd', { bubbles: true }));
      }
    } catch (e) {
      console.warn('Could not emit onSqueezeEnd on', this.grabbed, e);
    }

    setTimeout(() => {
      this.updateDebugText('Ready for next grab');
    }, 2000);

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
