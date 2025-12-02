// Sistema de desafio ritual viking - Portal para nova página
AFRAME.registerComponent('ritual-npc-guide', {
  schema: {
    dialogText: { type: 'string', default: 'Clique para iniciar o ritual de casamento' },
    portalUrl: { type: 'string', default: 'marriageChallenge.html' }
  },

  init: function () {
    this.setupInteraction();
    this.createDialog();
    this.hasActivated = false;
  },

  setupInteraction: function () {
    // Adicionar classe para interação
    this.el.classList.add('clickable');
    
    // Evento de clique
    this.el.addEventListener('click', this.onActivate.bind(this));
    
    // Visual feedback
    this.el.setAttribute('animation__pulse', {
      property: 'scale',
      to: '1.1 1.1 1.1',
      dur: 1000,
      loop: true,
      dir: 'alternate',
      easing: 'easeInOutQuad'
    });
  },

  createDialog: function () {
    const dialog = document.createElement('a-text');
    dialog.setAttribute('value', this.data.dialogText);
    dialog.setAttribute('position', '0 2.5 0');
    dialog.setAttribute('align', 'center');
    dialog.setAttribute('color', '#FFD700');
    dialog.setAttribute('width', '3');
    this.el.appendChild(dialog);
  },

  onActivate: function () {
    if (this.hasActivated) return;
    
    this.hasActivated = true;
    console.log('NPC ativado - criando portal para desafio');
    
    // Criar portal clicável
    this.createPortal();
    
    // Feedback visual
    this.showActivatedMessage();
  },

  createPortal: function () {
    const portal = document.createElement('a-entity');
    portal.setAttribute('id', 'ritual-portal');
    portal.setAttribute('position', '3 1 0');
    portal.setAttribute('class', 'clickable');
    
    // Portal visual
    const portalBox = document.createElement('a-box');
    portalBox.setAttribute('width', '2');
    portalBox.setAttribute('height', '3');
    portalBox.setAttribute('depth', '0.2');
    portalBox.setAttribute('color', '#4CAF50');
    portalBox.setAttribute('material', 'emissive: #4CAF50; emissiveIntensity: 0.5; opacity: 0.8; transparent: true');
    
    // Animação do portal
    portalBox.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      dur: 8000,
      loop: true,
      easing: 'linear'
    });
    
    // Texto do portal
    const portalText = document.createElement('a-text');
    portalText.setAttribute('value', 'Portal do Ritual\nClique para entrar');
    portalText.setAttribute('position', '0 0 0.2');
    portalText.setAttribute('align', 'center');
    portalText.setAttribute('color', '#FFFFFF');
    portalText.setAttribute('width', '3');
    
    // Link para nova página
    const portalLink = document.createElement('a-link');
    portalLink.setAttribute('href', this.data.portalUrl);
    portalLink.setAttribute('title', 'Entrar no Ritual de Casamento');
    portalLink.setAttribute('position', '0 0 0');
    portalLink.setAttribute('scale', '2 3 1');
    
    portal.appendChild(portalBox);
    portal.appendChild(portalText);
    portal.appendChild(portalLink);
    
    // Adicionar à cena
    this.el.sceneEl.appendChild(portal);
    
    // Efeito de aparição
    portal.setAttribute('scale', '0 0 0');
    portal.setAttribute('animation__appear', {
      property: 'scale',
      to: '1 1 1',
      dur: 1000,
      easing: 'easeOutBack'
    });
  },

  showActivatedMessage: function () {
    const dialog = this.el.querySelector('a-text');
    if (dialog) {
      dialog.setAttribute('value', 'Portal criado!\nClique no portal verde para\nentrar no desafio');
      dialog.setAttribute('color', '#00FF00');
    }
  }
});

// Componente para área de desafio
AFRAME.registerComponent('ritual-challenge-area', {
  schema: {
    requiredItems: { type: 'array', default: ['sword', 'ring'] }
  },

  init: function () {
    this.itemsExchanged = [];
    this.setupUI();
  },

  setupUI: function () {
    // Texto de instruções
    const instructions = document.createElement('a-text');
    instructions.setAttribute('id', 'challenge-instructions');
    instructions.setAttribute('value', 'Pegue a espada e o anel.\nLeve-os até a zona dourada para trocar.');
    instructions.setAttribute('position', '0 3 -5');
    instructions.setAttribute('align', 'center');
    instructions.setAttribute('color', '#FFD700');
    instructions.setAttribute('width', '5');
    this.el.appendChild(instructions);
  },

  registerExchange: function (itemType) {
    if (!this.itemsExchanged.includes(itemType)) {
      this.itemsExchanged.push(itemType);
      console.log(`Item trocado: ${itemType}`);
      
      this.updateUI();
      
      if (this.itemsExchanged.length === this.data.requiredItems.length) {
        this.onChallengeComplete();
      }
    }
  },

  updateUI: function () {
    const instructions = this.el.querySelector('#challenge-instructions');
    if (instructions) {
      const remaining = this.data.requiredItems.filter(
        item => !this.itemsExchanged.includes(item)
      );
      
      if (remaining.length > 0) {
        instructions.setAttribute('value', `Falta trocar: ${remaining.join(', ')}`);
        instructions.setAttribute('color', '#FFD700');
      } else {
        instructions.setAttribute('value', 'Ritual completo!\nO portal está aberto.');
        instructions.setAttribute('color', '#00FF00');
      }
    }
  },

  onChallengeComplete: function () {
    console.log('Desafio ritual completo!');
    
    // Mostrar portal de saída
    const exitPortal = this.el.querySelector('#exit-portal');
    if (exitPortal) {
      exitPortal.setAttribute('visible', 'true');
    }
    
    // Efeito visual de conclusão
    this.el.emit('challenge-complete');
  }
});

// Componente para itens de troca (espada/anel)
AFRAME.registerComponent('ritual-item', {
  schema: {
    itemType: { type: 'string', default: 'item' },
    exchangeZone: { type: 'string', default: '#exchange-zone' }
  },

  init: function () {
    this.isHeld = false;
    this.hasBeenExchanged = false;
    
    // Adicionar eventos de grab
    this.el.addEventListener('grab-start', this.onGrabStart.bind(this));
    this.el.addEventListener('grab-end', this.onGrabEnd.bind(this));
    
    // Highlight inicial
    this.addGlow();
  },

  addGlow: function () {
    // Aguardar até o modelo carregar antes de adicionar animação
    this.el.addEventListener('model-loaded', () => {
      // Adicionar brilho simples via opacity/scale em vez de emissive
      this.el.setAttribute('animation__glow', {
        property: 'scale',
        from: '1 1 1',
        to: '1.1 1.1 1.1',
        dur: 1000,
        loop: true,
        dir: 'alternate',
        easing: 'easeInOutSine'
      });
    });
  },

  onGrabStart: function () {
    this.isHeld = true;
    console.log(`${this.data.itemType} agarrado`);
  },

  onGrabEnd: function () {
    this.isHeld = false;
    
    if (!this.hasBeenExchanged) {
      this.checkExchange();
    }
  },

  checkExchange: function () {
    const exchangeZone = document.querySelector(this.data.exchangeZone);
    if (!exchangeZone) return;
    
    const itemPos = this.el.object3D.getWorldPosition(new THREE.Vector3());
    const zonePos = exchangeZone.object3D.getWorldPosition(new THREE.Vector3());
    const distance = itemPos.distanceTo(zonePos);
    
    // Se está perto da zona de troca (2 metros)
    if (distance < 2) {
      this.performExchange();
    }
  },

  performExchange: function () {
    if (this.hasBeenExchanged) return;
    
    this.hasBeenExchanged = true;
    console.log(`${this.data.itemType} trocado com sucesso!`);
    
    // Registrar no sistema de desafio
    const challengeArea = document.querySelector('[ritual-challenge-area]');
    if (challengeArea && challengeArea.components['ritual-challenge-area']) {
      challengeArea.components['ritual-challenge-area'].registerExchange(this.data.itemType);
    }
    
    // Animação de desaparecimento
    this.el.setAttribute('animation__shrink', {
      property: 'scale',
      to: '0 0 0',
      dur: 500,
      easing: 'easeInQuad'
    });
    
    // Remover após animação
    setTimeout(() => {
      this.el.parentNode.removeChild(this.el);
    }, 600);
  }
});

// Componente para zona de troca (onde o jogador leva os itens)
AFRAME.registerComponent('exchange-zone', {
  init: function () {
    // Visual da zona
    this.el.setAttribute('geometry', 'primitive: cylinder; radius: 1.5; height: 0.1');
    this.el.setAttribute('material', 'color: #FFD700; opacity: 0.5; transparent: true; side: double');
    
    // Animação rotativa
    this.el.setAttribute('animation', {
      property: 'rotation',
      to: '0 360 0',
      loop: true,
      dur: 4000,
      easing: 'linear'
    });
    
    // Texto explicativo
    const label = document.createElement('a-text');
    label.setAttribute('value', 'Zona de Troca');
    label.setAttribute('position', '0 0.5 0');
    label.setAttribute('align', 'center');
    label.setAttribute('color', '#FFD700');
    label.setAttribute('width', '3');
    this.el.appendChild(label);
  }
});

// Componente para verificar animações de modelos GLB
AFRAME.registerComponent('check-animations', {
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      const model = this.el.getObject3D('mesh');
      if (model && model.animations && model.animations.length > 0) {
        console.log(`Animações encontradas em ${this.el.id}:`, model.animations.map(a => a.name));
      } else {
        console.log(`Nenhuma animação encontrada em ${this.el.id}`);
      }
      
      // Check for shield object
      model.traverse((child) => {
        if (child.name.toLowerCase().includes('shield') || 
            child.name.toLowerCase().includes('escudo')) {
          console.log('Shield object found:', child.name);
          child.visible = false; // Hide shield
        }
        console.log('Model parts:', child.name);
      });
    });
  }
});

// Animações simples para NPC sem precisar de Blender
AFRAME.registerComponent('npc-idle-animation', {
  init: function () {
    // Respiração suave (balançar para cima/baixo)
    this.el.setAttribute('animation__breathe', {
      property: 'position',
      from: `${this.el.object3D.position.x} ${this.el.object3D.position.y} ${this.el.object3D.position.z}`,
      to: `${this.el.object3D.position.x} ${this.el.object3D.position.y + 0.05} ${this.el.object3D.position.z}`,
      dur: 3000,
      loop: true,
      dir: 'alternate',
      easing: 'easeInOutSine'
    });
  },

  // Animação de saudação/acenar
  greet: function () {
    // Rota ligeiramente para "acenar"
    this.el.setAttribute('animation__greet', {
      property: 'rotation',
      from: '0 180 0',
      to: '5 190 0',
      dur: 1000,
      dir: 'alternate',
      loop: 2,
      easing: 'easeOutElastic'
    });
  },

  // Animação de apontar para zona de troca
  pointToZone: function () {
    this.el.setAttribute('animation__point', {
      property: 'rotation',
      to: '0 220 0',
      dur: 800,
      easing: 'easeInOutQuad'
    });
    
    // Volta à posição original depois
    setTimeout(() => {
      this.el.setAttribute('rotation', '0 180 0');
    }, 2000);
  },

  // Animação de celebração
  celebrate: function () {
    this.el.setAttribute('animation__celebrate', {
      property: 'position',
      to: `${this.el.object3D.position.x} ${this.el.object3D.position.y + 0.3} ${this.el.object3D.position.z}`,
      dur: 500,
      dir: 'alternate',
      loop: 3,
      easing: 'easeOutQuad'
    });
  }
});
