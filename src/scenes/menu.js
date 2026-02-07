import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    const { width, height } = this.sys.game.config;
    
    this.currentPage = 0;
    this.totalPages = 7; // Removed materials page
    
    this.setupBackground();
    this.setupNavigation();
    this.showCurrentPage();
  }

  setupBackground() {
    // Create elegant gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x002244, 0x002244, 1);
    graphics.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);
  }

  setupNavigation() {
    const { width, height } = this.sys.game.config;
    
    // Skip button (always visible)
    this.skipButton = this.add.text(width - 20, 20, 'Skip to Game', {
      fontSize: '14px',
      color: '#888888',
      backgroundColor: '#333333',
      padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setInteractive();

    this.skipButton.on('pointerdown', () => {
      this.scene.start('game');
    });

    // Navigation buttons
    this.prevButton = this.add.text(50, height - 40, '← Previous', {
      fontSize: '16px',
      color: '#CCCCCC',
      backgroundColor: '#444444',
      padding: { x: 15, y: 8 }
    }).setOrigin(0, 1).setInteractive().setVisible(false);

    this.nextButton = this.add.text(width - 50, height - 40, 'Next →', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#006600',
      padding: { x: 15, y: 8 }
    }).setOrigin(1, 1).setInteractive();

    this.pageIndicator = this.add.text(width / 2, height - 40, '', {
      fontSize: '14px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5, 1);

    // Button events
    this.prevButton.on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.showCurrentPage();
      }
    });

    this.nextButton.on('pointerdown', () => {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.showCurrentPage();
      } else {
        this.scene.start('game');
      }
    });

    // Button hover effects
    this.nextButton.on('pointerover', () => {
      this.nextButton.setStyle({ backgroundColor: '#008800' });
    });
    this.nextButton.on('pointerout', () => {
      this.nextButton.setStyle({ backgroundColor: '#006600' });
    });

    this.prevButton.on('pointerover', () => {
      this.prevButton.setStyle({ backgroundColor: '#666666' });
    });
    this.prevButton.on('pointerout', () => {
      this.prevButton.setStyle({ backgroundColor: '#444444' });
    });
  }

  showCurrentPage() {
    // Clear previous page content
    if (this.pageContainer) {
      this.pageContainer.destroy();
    }
    
    this.pageContainer = this.add.container(0, 0);
    
    // Update navigation
    this.prevButton.setVisible(this.currentPage > 0);
    this.pageIndicator.setText(`${this.currentPage + 1} / ${this.totalPages}`);
    
    if (this.currentPage === this.totalPages - 1) {
      this.nextButton.setText('Start Game!');
    } else {
      this.nextButton.setText('Next →');
    }

    // Show the appropriate page
    switch(this.currentPage) {
      case 0: this.showWelcomePage(); break;
      case 1: this.showGridPage(); break; // Grid mechanics page
      case 2: this.showInfantryPage(); break;
      case 3: this.showArcherPage(); break;
      case 4: this.showRiderPage(); break;
      case 5: this.showBattlePage(); break;
      case 6: this.showReadyPage(); break;
    }
  }

  showWelcomePage() {
    const { width, height } = this.sys.game.config;
    
    // Title
    const title = this.add.text(width / 2, height * 0.2, 'SIEGE!!', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 8, fill: true }
    }).setOrigin(0.5, 0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height * 0.3, 'Craft • Battle • Conquer', {
      fontSize: '24px',
      color: '#CCCCCC',
      fontStyle: 'italic'
    }).setOrigin(0.5, 0.5);

    // Main description
    const description = this.add.text(width / 2, height * 0.5, 
      'Welcome to SIEGE!\n\n' +
      'A strategy game where you craft units\n' +
      'by arranging magical materials on a grid.\n\n' +
      'Different patterns create different troops\n' +
      'to lead into battle against enemy castle.',
      {
        fontSize: '20px',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5, 0.5);

    this.pageContainer.add([title, subtitle, description]);
  }

  showMaterialsPage() {
    const { width, height } = this.sys.game.config;
    
    const title = this.add.text(width / 2, height * 0.15, 'Magical Materials', {
      fontSize: '42px',
      color: '#FFD700',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    const description = this.add.text(width / 2, height * 0.25,
      'Four magical materials form the foundation of your army:',
      {
        fontSize: '18px',
        color: '#CCCCCC',
        align: 'center'
      }
    ).setOrigin(0.5, 0.5);

    // Material showcases
    const materials = [
      { key: 'wood', name: 'WOOD', desc: 'Brown • Foundation material', x: width * 0.2 },
      { key: 'steel', name: 'STEEL', desc: 'Gray • Strong and durable', x: width * 0.4 },
      { key: 'fire', name: 'FIRE', desc: 'Red • Powerful and aggressive', x: width * 0.6 },
      { key: 'magic', name: 'MAGIC', desc: 'Green • Mystical energy', x: width * 0.8 }
    ];

    materials.forEach(material => {
      const sprite = this.add.sprite(material.x, height * 0.5, 'elements', material.key);
      sprite.setDisplaySize(80, 80);
      
      const name = this.add.text(material.x, height * 0.62, material.name, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontWeight: 'bold',
        align: 'center'
      }).setOrigin(0.5, 0.5);
      
      const desc = this.add.text(material.x, height * 0.68, material.desc, {
        fontSize: '12px',
        color: '#CCCCCC',
        align: 'center'
      }).setOrigin(0.5, 0.5);

      this.pageContainer.add([sprite, name, desc]);
    });

    const bottomText = this.add.text(width / 2, height * 0.8,
      'Combine these materials in specific patterns to craft mighty warriors!',
      {
        fontSize: '16px',
        color: '#FFFFFF',
        align: 'center'
      }
    ).setOrigin(0.5, 0.5);

    this.pageContainer.add([title, description, bottomText]);
  }

  showGridPage() {
    const { width, height } = this.sys.game.config;
    
    const title = this.add.text(width / 2, height * 0.1, 'The Crafting Grid', {
      fontSize: '42px',
      color: '#FFD700',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    // Show a mini grid visualization
    const gridX = width * 0.3;
    const gridY = height * 0.35;
    const cellSize = 30;
    
    // Draw grid cells
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const x = gridX + col * (cellSize + 2);
        const y = gridY + row * (cellSize + 2);
        
        // Random material for demo
        const materials = ['wood', 'steel', 'fire', 'magic'];
        const material = Phaser.Math.RND.pick(materials);
        const sprite = this.add.sprite(x, y, 'elements', material);
        sprite.setDisplaySize(cellSize, cellSize);
        
        // Highlight crafting area (bottom 2 rows)
        if (row >= 3) {
          const highlight = this.add.rectangle(x, y, cellSize + 4, cellSize + 4)
            .setStrokeStyle(2, 0xFFD700, 0.8);
          this.pageContainer.add(highlight);
        }
        
        // Show cursor on one cell
        if (row === 4 && col === 2) {
          const cursor = this.add.rectangle(x, y, cellSize + 6, cellSize + 6)
            .setStrokeStyle(3, 0xFFFFFF);
          this.pageContainer.add(cursor);
        }
        
        this.pageContainer.add(sprite);
      }
    }

    // Arrows pointing to crafting positions
    const positions = [0, 2, 4];
    positions.forEach(pos => {
      const arrow = this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 20, '↑', {
        fontSize: '20px',
        color: '#00FF00',
        fontWeight: 'bold'
      }).setOrigin(0.5, 0);
      
      const label = this.add.text(gridX + pos * (cellSize + 2), gridY + 5 * (cellSize + 2) + 45, `Pos ${pos}`, {
        fontSize: '12px',
        color: '#00FF00'
      }).setOrigin(0.5, 0);
      
      this.pageContainer.add([arrow, label]);
    });

    // Instructions - repositioned to fit better
    const instructions = this.add.text(width * 0.65, height * 0.25,
      'How to Use the Grid:\n\n' +
      '🎮 ARROW KEYS - Move cursor\n' +
      '⚡ SPACE BAR - Select/Swap\n' +
      '🚀 R KEY - Release units!',
      {
        fontSize: '12px',
        color: '#FFFFFF',
        align: 'left',
        lineSpacing: 3,
        wordWrap: { width: 180 }
      }
    ).setOrigin(0, 0);

    // Building zone instructions - separate section with better positioning
    const buildingZoneTitle = this.add.text(width * 0.65, height * 0.45,
      '🏗️ BUILD ZONE:',
      {
        fontSize: '13px',
        color: '#FFD700',
        fontWeight: 'bold',
        align: 'left'
      }
    ).setOrigin(0, 0);

    const buildingZoneInstructions = this.add.text(width * 0.65, height * 0.49,
      'Golden area = crafting zone\n' +
      'Start at positions 0, 2, or 4',
      {
        fontSize: '11px',
        color: '#FFFFFF',
        align: 'left',
        lineSpacing: 2,
        wordWrap: { width: 180 }
      }
    ).setOrigin(0, 0);

    // Tip box - moved and resized to fit
    const tipBox = this.add.rectangle(width * 0.65, height * 0.65, 180, 60, 0x004400, 0.8);
    tipBox.setOrigin(0, 0.5);
    
    const tip = this.add.text(width * 0.65 + 10, height * 0.65,
      '💡 TIP: Build patterns from\nbottom to top! The bottom row\nis your foundation.',
      {
        fontSize: '10px',
        color: '#FFFFFF',
        align: 'left',
        lineSpacing: 3,
        wordWrap: { width: 160 }
      }
    ).setOrigin(0, 0.5);

    this.pageContainer.add([title, instructions, buildingZoneTitle, buildingZoneInstructions, tipBox, tip]);
  }

  showInfantryPage() {
    this.showUnitPage('soldier', 'INFANTRY', 
      'Stack STEEL over WOOD to create brave foot soldiers',
      'Strong melee fighters that form the backbone of your army'
    );
  }

  showArcherPage() {
    this.showUnitPage('archer', 'ARCHER',
      'Stack FIRE over WOOD to create skilled marksmen', 
      'Ranged attackers that strike from a distance'
    );
  }

  showRiderPage() {
    this.showUnitPage('lancer', 'RAIDER',
      'Create a 2×2 pattern: FIRE and STEEL on both rows',
      'Fast warriors that charge into battle and deal a lot of damage'
    );
  }

  showUnitPage(unitKey, unitName, pattern, description) {
    const { width, height } = this.sys.game.config;
    
    const title = this.add.text(width / 2, height * 0.15, unitName, {
      fontSize: '42px',
      color: '#FFD700',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    // Get pattern data
    const unitPatterns = this.cache.json.get("unitPatterns");
    const unitPattern = unitPatterns.find(p => p.unit === unitKey);
    
    // Show pattern
    this.showPattern(unitPattern, width * 0.3, height * 0.4);
    
    // Show unit sprite with run animation from Aseprite atlas
    const unitSprite = this.add.sprite(width * 0.7, height * 0.45, unitKey);
    unitSprite.setScale(3);
    unitSprite.play({ key: unitKey + '-run', repeat: -1 });

    const patternDesc = this.add.text(width / 2, height * 0.65, pattern, {
      fontSize: '18px',
      color: '#FFFFFF',
      align: 'center',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    const unitDesc = this.add.text(width / 2, height * 0.75, description, {
      fontSize: '16px',
      color: '#CCCCCC',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.pageContainer.add([title, unitSprite, patternDesc, unitDesc]);
  }

  showPattern(patternData, x, y) {
    const tileSize = 50;
    const reversedPattern = [...patternData.pattern].reverse(); // Build from bottom up
    
    // Add pattern label
    const label = this.add.text(x, y - 60, 'Pattern:', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);
    this.pageContainer.add(label);
    
    for (let row = 0; row < reversedPattern.length; row++) {
      for (let col = 0; col < reversedPattern[row].length; col++) {
        const material = reversedPattern[row][col];
        const spriteX = x + (col - reversedPattern[0].length / 2 + 0.5) * (tileSize + 5);
        const spriteY = y + (row - reversedPattern.length / 2 + 0.5) * (tileSize + 5);
        
        const sprite = this.add.sprite(spriteX, spriteY, material);
        sprite.setDisplaySize(tileSize, tileSize);
        
        const border = this.add.rectangle(spriteX, spriteY, tileSize, tileSize)
          .setStrokeStyle(3, 0xFFFFFF, 0.9);
        
        this.pageContainer.add([sprite, border]);
      }
    }
  }

  showBattlePage() {
    const { width, height } = this.sys.game.config;
    
    const title = this.add.text(width / 2, height * 0.15, 'BATTLE!', {
      fontSize: '42px',
      color: '#FF4444',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    const description = this.add.text(width / 2, height * 0.3,
      'Your crafted units automatically march toward the enemy castle.\n\n' +
      'They fight any enemies they encounter along the way.\n\n' +
      'Craft wisely and overwhelm your opponents!',
      {
        fontSize: '18px',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5, 0.5);

    // Show example units marching
    const unitY = height * 0.6;
    const units = ['soldier', 'archer', 'lancer'];
    units.forEach((unit, index) => {
      const sprite = this.add.sprite(width * 0.2 + index * 150, unitY, unit);
      sprite.setScale(2);
      sprite.play({ key: unit + '-run', repeat: -1 });
      this.pageContainer.add(sprite);
    });

    const arrow = this.add.text(width * 0.75, unitY, '→ ENEMY CASTLE', {
      fontSize: '16px',
      color: '#FF6666',
      fontWeight: 'bold'
    }).setOrigin(0, 0.5);

    this.pageContainer.add([title, description, arrow]);
  }

  showReadyPage() {
    const { width, height } = this.sys.game.config;
    
    const title = this.add.text(width / 2, height * 0.2, 'READY FOR BATTLE?', {
      fontSize: '48px',
      color: '#FFD700',
      fontWeight: 'bold'
    }).setOrigin(0.5, 0.5);

    const tips = this.add.text(width / 2, height * 0.4,
      '💡 Quick Tips:\n\n' +
      '• Use arrow keys + SPACE to arrange materials\n' +
      '• Build patterns at positions 0, 2, or 4 in the bottom row\n' +
      '• Press R to deploy your crafted army\n' +
      '• Different unit combinations create powerful armies\n' +
      '• Destroy the enemy castle to win!',
      {
        fontSize: '16px',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5, 0.5);

    const encouragement = this.add.text(width / 2, height * 0.75,
      'The realm awaits your strategic genius!\n\nGood luck, Commander!',
      {
        fontSize: '18px',
        color: '#CCCCCC',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5, 0.5);

    this.pageContainer.add([title, tips, encouragement]);
  }
}
