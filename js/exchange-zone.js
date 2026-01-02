/* global AFRAME, THREE */

AFRAME.registerComponent('exchange-zone', {
  init: function () {
    this.swordPlaced = false;
    this.ringPlaced = false;
    this.checkInterval = null;

    // Criar texto de debug
    /* 
    this.debugText = document.createElement('a-text');
    this.debugText.setAttribute('value', 'Exchange Zone Ready');
    this.debugText.setAttribute('position', '2 2 -6');
    this.debugText.setAttribute('align', 'center');
    this.debugText.setAttribute('color', '#FFFF00');
    this.debugText.setAttribute('width', '4');
    this.el.sceneEl.appendChild(this.debugText);
    */

    // Começar a verificar objetos a cada 500ms
    this.checkInterval = setInterval(() => {
      this.checkObjects();
    }, 500);
  },

  checkObjects: function () {
    const zonePos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(zonePos);
    const zoneRadius = 1.5; // Raio do cilindro

    // Verificar espada
    const sword = document.getElementById('player-sword');
    if (sword && !this.swordPlaced) {
      const swordPos = new THREE.Vector3();
      sword.object3D.getWorldPosition(swordPos);
      const distance = Math.sqrt(
        Math.pow(swordPos.x - zonePos.x, 2) +
        Math.pow(swordPos.z - zonePos.z, 2)
      );

      if (distance < zoneRadius) {
        this.placeSword(sword);
      }
    }

    // Verificar anel
    const ring = document.getElementById('ritual-ring');
    if (ring && !this.ringPlaced) {
      const ringPos = new THREE.Vector3();
      ring.object3D.getWorldPosition(ringPos);
      const distance = Math.sqrt(
        Math.pow(ringPos.x - zonePos.x, 2) +
        Math.pow(ringPos.z - zonePos.z, 2)
      );

      if (distance < zoneRadius) {
        this.placeRing(ring);
      }
    }

    // Atualizar debug
    /*
    const status = 'Sword: ' + (this.swordPlaced ? 'YES' : 'NO') + ' | Ring: ' + (this.ringPlaced ? 'YES' : 'NO');
    this.debugText.setAttribute('value', status);
    */

    // Se ambos colocados, completar ritual
    if (this.swordPlaced && this.ringPlaced) {
      this.completeRitual();
    }
  },

  placeSword: function (sword) {
    this.swordPlaced = true;
    sword.setAttribute('visible', 'false');
    console.log('Sword placed in exchange zone!');

    // Efeito visual
    const flash = document.createElement('a-sphere');
    flash.setAttribute('position', '2 0.5 -6');
    flash.setAttribute('radius', '1');
    flash.setAttribute('color', '#FFD700');
    flash.setAttribute('opacity', '0.9');
    flash.setAttribute('material', 'transparent: true');
    flash.setAttribute('animation', 'property: scale; to: 6 6 6; dur: 2000; easing: easeOutQuad');
    flash.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 2000; easing: easeOutQuad');
    this.el.sceneEl.appendChild(flash);

    setTimeout(() => {
      flash.parentNode.removeChild(flash);
    }, 2000);
  },

  placeRing: function (ring) {
    this.ringPlaced = true;
    ring.setAttribute('visible', 'false');
    console.log('Ring placed in exchange zone!');

    // Efeito visual
    const flash = document.createElement('a-sphere');
    flash.setAttribute('position', '2 0.5 -6');
    flash.setAttribute('radius', '1');
    flash.setAttribute('color', '#FFD700');
    flash.setAttribute('opacity', '0.9');
    flash.setAttribute('material', 'transparent: true');
    flash.setAttribute('animation', 'property: scale; to: 6 6 6; dur: 2000; easing: easeOutQuad');
    flash.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 2000; easing: easeOutQuad');
    this.el.sceneEl.appendChild(flash);

    setTimeout(() => {
      flash.parentNode.removeChild(flash);
    }, 2000);
  },

  completeRitual: function () {
    clearInterval(this.checkInterval);

    /*
    this.debugText.setAttribute('value', 'RITUAL COMPLETE!');
    this.debugText.setAttribute('color', '#00FF00');
    */

    console.log('Ritual completed! Showing portal...');

    // Mostrar portal de volta
    setTimeout(() => {
      const portal = document.getElementById('return-portal');
      if (portal) {
        portal.setAttribute('visible', 'true');
      }
    }, 2000);

    // Trigger NPC thankful animation/model when ritual completes
    setTimeout(() => {
      const npc = document.getElementById('npc-astrid');
      if (npc) {
        // Trocar modelo para o asset com animação "thankful"
        try {
          npc.setAttribute('gltf-model', '#npc-thankful');
          // Garantir que o animation-mixer é ativado para reproduzir a animação do glb
          npc.setAttribute('animation-mixer', '');
          // Pequena animação adicional de celebração (opcional)
          npc.setAttribute('animation__celebrate', 'property: position; to: 2 0.5 -6.5; dur: 600; dir: alternate; loop: 3');
        } catch (e) {
          console.warn('Could not switch NPC model or play animation:', e);
        }
      }
    }, 2200);
  },

  remove: function () {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
});
