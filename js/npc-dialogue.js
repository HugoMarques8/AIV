// Componente para diálogo com NPC e portal para desafio
AFRAME.registerComponent('npc-dialogue', {
  schema: {
    audioSrc: { type: 'string', default: '' },
    portalDestination: { type: 'string', default: 'marriageChallenge.html' }
  },

  init: function () {
    this.dialogueActive = false;
    this.audioPlayed = false;
    this.portalEntity = null;
    
    // Criar overlay de diálogo
    this.createDialogueUI();
    
    // Event listener para clique no NPC
    this.el.addEventListener('click', () => {
      if (!this.dialogueActive) {
        this.startDialogue();
      }
    });
    
    // Adicionar classe clickable para raycaster
    this.el.classList.add('clickable');
  },

  createDialogueUI: function() {
    // Criar painel de diálogo flutuante acima do NPC
    this.dialoguePanel = document.createElement('a-entity');
    this.dialoguePanel.setAttribute('position', '8.5 2.5 4');
    this.dialoguePanel.setAttribute('visible', 'false');
    
    // Background do diálogo
    const background = document.createElement('a-plane');
    background.setAttribute('width', '3');
    background.setAttribute('height', '1.5');
    background.setAttribute('color', '#1a1a1a');
    background.setAttribute('opacity', '0.9');
    this.dialoguePanel.appendChild(background);
    
    // Texto do diálogo
    this.dialogueText = document.createElement('a-text');
    this.dialogueText.setAttribute('value', 'Greetings, traveler...');
    this.dialogueText.setAttribute('align', 'center');
    this.dialogueText.setAttribute('width', '2.8');
    this.dialogueText.setAttribute('color', '#ffffff');
    this.dialogueText.setAttribute('wrap-count', '40');
    this.dialogueText.setAttribute('position', '0 0.3 0.01');
    this.dialoguePanel.appendChild(this.dialogueText);
    
    // Botão "Yes, I'm ready"
    this.yesButton = document.createElement('a-entity');
    this.yesButton.setAttribute('position', '-0.6 -0.4 0.01');
    this.yesButton.setAttribute('geometry', 'primitive: plane; width: 1; height: 0.3');
    this.yesButton.setAttribute('material', 'color: #2d5016');
    this.yesButton.classList.add('clickable');
    
    const yesText = document.createElement('a-text');
    yesText.setAttribute('value', 'Yes, I am ready');
    yesText.setAttribute('align', 'center');
    yesText.setAttribute('width', '2');
    yesText.setAttribute('color', '#ffffff');
    yesText.setAttribute('position', '0 0 0.01');
    this.yesButton.appendChild(yesText);
    
    this.yesButton.addEventListener('click', () => {
      this.openPortal();
    });
    
    this.dialoguePanel.appendChild(this.yesButton);
    
    // Botão "Not yet"
    this.noButton = document.createElement('a-entity');
    this.noButton.setAttribute('position', '0.6 -0.4 0.01');
    this.noButton.setAttribute('geometry', 'primitive: plane; width: 1; height: 0.3');
    this.noButton.setAttribute('material', 'color: #5d1616');
    this.noButton.classList.add('clickable');
    
    const noText = document.createElement('a-text');
    noText.setAttribute('value', 'Not yet');
    noText.setAttribute('align', 'center');
    noText.setAttribute('width', '2');
    noText.setAttribute('color', '#ffffff');
    noText.setAttribute('position', '0 0 0.01');
    this.noButton.appendChild(noText);
    
    this.noButton.addEventListener('click', () => {
      this.closeDialogue();
    });
    
    this.dialoguePanel.appendChild(this.noButton);
    
    // Adicionar painel à entidade NPC
    this.el.appendChild(this.dialoguePanel);
    
    // Fazer o painel sempre olhar para a câmara
    this.dialoguePanel.setAttribute('look-at', '[camera]');
  },

  startDialogue: function() {
    this.dialogueActive = true;
    this.dialoguePanel.setAttribute('visible', 'true');
    
    // Texto do diálogo
    const dialogueText = "Greetings, traveler. I am Astrid, keeper of the marriage rituals.\n\n" +
                        "I have just completed the ceremonial bath, washing away my maidenhood " +
                        "as our ancestors did before me.\n\n" +
                        "Are you ready to witness the sacred ceremony?";
    
    this.dialogueText.setAttribute('value', dialogueText);
    
    // Tocar áudio se existir
    if (this.data.audioSrc && !this.audioPlayed) {
      this.playAudio();
    }
  },

  playAudio: function() {
    // Criar elemento de áudio se ainda não existe
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.src = this.data.audioSrc;
      document.body.appendChild(this.audioElement);
    }
    
    this.audioElement.play();
    this.audioPlayed = true;
  },

  closeDialogue: function() {
    this.dialogueActive = false;
    this.dialoguePanel.setAttribute('visible', 'false');
  },

  openPortal: function() {
    this.closeDialogue();
    
    // Criar portal
    if (!this.portalEntity) {
      this.portalEntity = document.createElement('a-entity');
      this.portalEntity.setAttribute('position', '0 1 -2'); // Na frente do NPC
      
      // Anel externo do portal (azul brilhante)
      const outerRing = document.createElement('a-torus');
      outerRing.setAttribute('radius', '1.5');
      outerRing.setAttribute('radius-tubular', '0.1');
      outerRing.setAttribute('color', '#00ffff');
      outerRing.setAttribute('material', 'shader: flat; emissive: #00ffff; emissiveIntensity: 0.8');
      outerRing.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear');
      this.portalEntity.appendChild(outerRing);
      
      // Centro do portal (semi-transparente)
      const center = document.createElement('a-circle');
      center.setAttribute('radius', '1.4');
      center.setAttribute('color', '#001a33');
      center.setAttribute('material', 'opacity: 0.7; side: double');
      center.setAttribute('animation', 'property: material.opacity; from: 0.7; to: 0.9; dir: alternate; loop: true; dur: 2000');
      this.portalEntity.appendChild(center);
      
      // Partículas ao redor do portal
      const particles = document.createElement('a-entity');
      particles.setAttribute('particle-system', 'preset: default; color: #00ffff, #0066ff; particleCount: 100; maxAge: 3; size: 0.5');
      this.portalEntity.appendChild(particles);
      
      // Tornar portal clicável
      this.portalEntity.classList.add('clickable');
      this.portalEntity.addEventListener('click', () => {
        window.location.href = this.data.portalDestination;
      });
      
      // Adicionar à cena
      this.el.sceneEl.appendChild(this.portalEntity);
      
      // Som de portal (opcional)
      this.playPortalSound();
    }
  },

  playPortalSound: function() {
    // Som de portal aparecendo (usando Web Audio API para gerar som)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  },

  remove: function() {
    if (this.portalEntity) {
      this.portalEntity.parentNode.removeChild(this.portalEntity);
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.remove();
    }
  }
});
