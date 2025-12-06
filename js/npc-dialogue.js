// Componente simplificado para diálogo com NPC
AFRAME.registerComponent('npc-dialogue', {
  schema: {
    audioSrc: { type: 'string', default: '' },
    dialogueId: { type: 'string', default: 'dialogue-panel' }
  },

  init: function () {
    this.dialogueActive = false;
    this.audioPlayed = false;
    
    // Event listener para clique no NPC
    this.el.addEventListener('click', () => {
      console.log('NPC clicked!');
      if (!this.dialogueActive) {
        this.showDialogue();
      }
    });
    
    // Adicionar classe clickable
    this.el.classList.add('clickable');
  },

  showDialogue: function() {
    console.log('Showing dialogue');
    this.dialogueActive = true;
    
    // Encontrar o painel de diálogo na cena
    const dialoguePanel = document.getElementById(this.data.dialogueId);
    if (dialoguePanel) {
      dialoguePanel.setAttribute('visible', 'true');
      console.log('Dialogue panel visible');
    } else {
      console.error('Dialogue panel not found!');
    }
    
    // Tocar áudio
    if (this.data.audioSrc && !this.audioPlayed) {
      this.playAudio();
    }
  },

  hideDialogue: function() {
    this.dialogueActive = false;
    const dialoguePanel = document.getElementById(this.data.dialogueId);
    if (dialoguePanel) {
      dialoguePanel.setAttribute('visible', 'false');
    }
  },

  playAudio: function() {
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.src = this.data.audioSrc;
      document.body.appendChild(this.audioElement);
      
      // Quando o áudio terminar, esconder diálogo e mostrar portal
      this.audioElement.addEventListener('ended', () => {
        console.log('Audio ended, showing portal');
        this.hideDialogue();
        
        // Mostrar portal
        const portal = document.getElementById('challenge-portal');
        if (portal) {
          portal.setAttribute('visible', 'true');
        }
      });
    }
    this.audioElement.play();
    this.audioPlayed = true;
  }
});

// Componente para botão de resposta
AFRAME.registerComponent('dialogue-button', {
  schema: {
    action: { type: 'string', default: 'close' }, // 'close' ou 'portal'
    dialogueId: { type: 'string', default: 'dialogue-panel' }
  },

  init: function() {
    this.el.classList.add('clickable');
    this.el.addEventListener('click', () => {
      if (this.data.action === 'close') {
        this.closeDialogue();
      } else if (this.data.action === 'portal') {
        this.openPortal();
      }
    });
  },

  closeDialogue: function() {
    const dialoguePanel = document.getElementById(this.data.dialogueId);
    if (dialoguePanel) {
      dialoguePanel.setAttribute('visible', 'false');
    }
  },

  openPortal: function() {
    this.closeDialogue();
    
    // Mostrar portal que já existe na cena
    const portal = document.getElementById('challenge-portal');
    if (portal) {
      portal.setAttribute('visible', 'true');
    }
  }
});
