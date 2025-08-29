// Main game initialization for Void Miner

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: GameConfig.GAME_WIDTH,
    height: GameConfig.GAME_HEIGHT,
    backgroundColor: GameConfig.BACKGROUND_COLOR,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GameConfig.GAME_WIDTH,
        height: GameConfig.GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },  // No gravity in space!
            debug: false              // Set to true for collision debugging
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game objects
let ship;
let cursors;
let graphics;
let asteroids = []; // Array to hold all asteroids

// Auto-stabilization system
let autoStabilizing = false;
let stabilizationTimer = 0;
const STABILIZATION_DURATION = 1500; // 1.5 seconds
const STABILIZATION_POWER = 0.3; // 30% of main thrust power

// Initialize the game
const game = new Phaser.Game(config);

function preload() {
    // No external assets to load yet - we'll create everything with graphics
    console.log('Void Miner: Assets loaded');
}

function create() {
    console.log('Void Miner: Game scene created');
    
    // Remove loading text
    document.querySelector('.loading').style.display = 'none';
    
    // Create graphics object for drawing shapes
    graphics = this.add.graphics();
    
    // Create ship as a simple physics body (no sprite)
    ship = this.physics.add.sprite(
        GameConfig.GAME_WIDTH / 2, 
        GameConfig.GAME_HEIGHT / 2, 
        null
    );
    
    // Make ship invisible since we'll draw it manually
    ship.setVisible(false);
    
    // Ship physics properties
    ship.setMaxVelocity(GameConfig.SHIP.MAX_SPEED);
    ship.setDrag(GameConfig.SHIP.FRICTION * 100); // Convert to Phaser drag value
    ship.setCollideWorldBounds(false); // Allow wrapping around edges
    
    // Check if Asteroid class exists
    if (typeof Asteroid !== 'undefined') {
        console.log('Asteroid class found, generating asteroids...');
        generateAsteroids();
    } else {
        console.error('Asteroid class not found! Check if Asteroid.js is loaded.');
    }
    
    // Set up keyboard controls (for desktop testing)
    cursors = this.input.keyboard.createCursorKeys();
    
    // Add text for debugging
    this.add.text(10, 10, 'Void Miner v0.2', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: GameConfig.UI.TEXT_COLOR
    });
    
    this.add.text(10, GameConfig.GAME_HEIGHT - 50, 'Arrow Keys: Move | Space: Thrust', {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: GameConfig.UI.TEXT_COLOR
    });
    
    // Debug text for stabilization
    this.debugText = this.add.text(10, GameConfig.GAME_HEIGHT - 30, '', {
        fontFamily: 'Courier New',
        fontSize: '10px',
        color: GameConfig.UI.WARNING_COLOR
    });
}

function update() {
    // Handle keyboard input (desktop testing)
    handleInput();
    
    // Handle auto-stabilization
    handleStabilization();
    
    // Handle screen wrapping
    wrapPosition();
    
    // Clear graphics for this frame
    graphics.clear();
    
    // Update and draw all asteroids
    for (let asteroid of asteroids) {
        asteroid.update(graphics);
    }
    
    // Draw ship (after asteroids so it appears on top)
    drawShip();
    
    // Update debug text
    if (game.scene.scenes[0].debugText) {
        const currentSpeed = Math.sqrt(ship.body.velocity.x ** 2 + ship.body.velocity.y ** 2);
        game.scene.scenes[0].debugText.setText(
            `Speed: ${currentSpeed.toFixed(1)} | Stabilizing: ${autoStabilizing} | Timer: ${(stabilizationTimer/1000).toFixed(1)}s | Asteroids: ${asteroids.length}`
        );
    }
}

function handleInput() {
    if (cursors.left.isDown) {
        ship.setAngularVelocity(-GameConfig.SHIP.ROTATION_SPEED * 100);
    } else if (cursors.right.isDown) {
        ship.setAngularVelocity(GameConfig.SHIP.ROTATION_SPEED * 100);
    } else {
        ship.setAngularVelocity(0);
    }
    
    if (cursors.up.isDown) {
        // Calculate thrust direction based on ship rotation - FIXED coordinate system
        // Ship rotation 0 = pointing right, so thrust should match visual direction
        const thrustX = Math.cos(ship.rotation) * GameConfig.SHIP.ACCELERATION;
        const thrustY = Math.sin(ship.rotation) * GameConfig.SHIP.ACCELERATION;
        
        ship.setAcceleration(thrustX, thrustY);
        
        // Cancel auto-stabilization when actively thrusting
        autoStabilizing = false;
        stabilizationTimer = 0;
    } else {
        ship.setAcceleration(0, 0);
        
        // Start auto-stabilization when thrust is released
        const currentSpeed = Math.sqrt(ship.body.velocity.x ** 2 + ship.body.velocity.y ** 2);
        if (currentSpeed > 20 && !autoStabilizing) { // Only stabilize if moving fast enough
            autoStabilizing = true;
            stabilizationTimer = STABILIZATION_DURATION;
        }
    }
}

function drawShip() {
    // Ship color - bright green for visibility
    graphics.lineStyle(3, 0x00FF00); // Thick green line for ship
    
    const size = GameConfig.SHIP.SIZE;
    const x = ship.x;
    const y = ship.y;
    const rotation = ship.rotation;
    
    // Calculate triangle points - classic Asteroids style
    // In Phaser: rotation 0 = pointing right, rotation increases clockwise
    // So we need to draw the triangle pointing in the direction of rotation
    
    // Nose (front of ship) - points in direction of rotation
    const noseX = x + Math.cos(rotation) * size;
    const noseY = y + Math.sin(rotation) * size;
    
    // Left wing (120 degrees counter-clockwise from nose)
    const leftX = x + Math.cos(rotation + (2 * Math.PI / 3)) * size * 0.7;
    const leftY = y + Math.sin(rotation + (2 * Math.PI / 3)) * size * 0.7;
    
    // Right wing (120 degrees clockwise from nose)  
    const rightX = x + Math.cos(rotation - (2 * Math.PI / 3)) * size * 0.7;
    const rightY = y + Math.sin(rotation - (2 * Math.PI / 3)) * size * 0.7;
    
    // Draw triangle
    graphics.beginPath();
    graphics.moveTo(noseX, noseY);
    graphics.lineTo(leftX, leftY);
    graphics.lineTo(rightX, rightY);
    graphics.closePath();
    graphics.strokePath();
    
    // Draw main thrust flames - should come from rear of ship
    if (cursors && cursors.up.isDown) {
        graphics.lineStyle(4, 0xFF4400); // Thick orange flames - increased from 3 to 4
        
        // Main flame from center of rear edge, pointing opposite to nose direction
        const rearCenterX = (leftX + rightX) / 2;
        const rearCenterY = (leftY + rightY) / 2;
        const flameX = rearCenterX - Math.cos(rotation) * size * 2.0; // Increased from 1.5 to 2.0
        const flameY = rearCenterY - Math.sin(rotation) * size * 2.0;
        
        graphics.beginPath();
        graphics.moveTo(rearCenterX, rearCenterY);
        graphics.lineTo(flameX, flameY);
        graphics.strokePath();
        
        // Add secondary flame streams for extra visual impact
        graphics.lineStyle(2, 0xFF6600); // Slightly lighter orange, thinner
        
        // Left secondary flame
        const leftFlameX = leftX - Math.cos(rotation) * size * 1.7;
        const leftFlameY = leftY - Math.sin(rotation) * size * 1.7;
        
        graphics.beginPath();
        graphics.moveTo(leftX, leftY);
        graphics.lineTo(leftFlameX, leftFlameY);
        graphics.strokePath();
        
        // Right secondary flame
        const rightFlameX = rightX - Math.cos(rotation) * size * 1.7;
        const rightFlameY = rightY - Math.sin(rotation) * size * 1.7;
        
        graphics.beginPath();
        graphics.moveTo(rightX, rightY);
        graphics.lineTo(rightFlameX, rightFlameY);
        graphics.strokePath();
    }
    
    // Draw stabilization thrusters - pointing OPPOSITE to velocity direction
    if (autoStabilizing && stabilizationTimer > 0) {
        graphics.lineStyle(4, 0x00AAFF); // Very thick bright blue
        
        // Get velocity direction
        const velX = ship.body.velocity.x;
        const velY = ship.body.velocity.y;
        const velMag = Math.sqrt(velX * velX + velY * velY);
        
        if (velMag > 0) {
            // Calculate thrust direction - SAME as velocity direction (flames point where thrust is applied)
            const thrustDirX = velX / velMag;
            const thrustDirY = velY / velMag;
            
            // Main stabilizer from nose - flame points in direction of thrust
            const stabilX = noseX + thrustDirX * size * 1.2;
            const stabilY = noseY + thrustDirY * size * 1.2;
            
            graphics.beginPath();
            graphics.moveTo(noseX, noseY);
            graphics.lineTo(stabilX, stabilY);
            graphics.strokePath();
            
            // Side stabilizers from wings
            graphics.lineStyle(2, 0x44AAFF);
            
            const leftStabilX = leftX + thrustDirX * size * 0.8;
            const leftStabilY = leftY + thrustDirY * size * 0.8;
            
            const rightStabilX = rightX + thrustDirX * size * 0.8;
            const rightStabilY = rightY + thrustDirY * size * 0.8;
            
            graphics.beginPath();
            graphics.moveTo(leftX, leftY);
            graphics.lineTo(leftStabilX, leftStabilY);
            graphics.strokePath();
            
            graphics.beginPath();
            graphics.moveTo(rightX, rightY);
            graphics.lineTo(rightStabilX, rightStabilY);
            graphics.strokePath();
        }
    }
}

function wrapPosition() {
    const padding = GameConfig.WORLD.WRAP_PADDING;
    
    // Wrap horizontally
    if (ship.x > GameConfig.GAME_WIDTH + padding) {
        ship.x = -padding;
    } else if (ship.x < -padding) {
        ship.x = GameConfig.GAME_WIDTH + padding;
    }
    
    // Wrap vertically
    if (ship.y > GameConfig.GAME_HEIGHT + padding) {
        ship.y = -padding;
    } else if (ship.y < -padding) {
        ship.y = GameConfig.GAME_HEIGHT + padding;
    }
}

function handleStabilization() {
    if (autoStabilizing && stabilizationTimer > 0) {
        // Decrease timer
        stabilizationTimer -= game.loop.delta;
        
        // Calculate current velocity
        const velocityX = ship.body.velocity.x;
        const velocityY = ship.body.velocity.y;
        const currentSpeed = Math.sqrt(velocityX ** 2 + velocityY ** 2);
        
        // Stop stabilizing if we're moving slowly enough
        if (currentSpeed < 10) {
            autoStabilizing = false;
            stabilizationTimer = 0;
            return;
        }
        
        // Apply reverse thrust proportional to current velocity
        const stabilizationForce = GameConfig.SHIP.ACCELERATION * STABILIZATION_POWER;
        const reverseX = -(velocityX / currentSpeed) * stabilizationForce;
        const reverseY = -(velocityY / currentSpeed) * stabilizationForce;
        
        ship.setAcceleration(reverseX, reverseY);
    } else if (stabilizationTimer <= 0 && autoStabilizing) {
        // Stabilization time expired
        autoStabilizing = false;
        ship.setAcceleration(0, 0);
    }
}

function generateAsteroids() {
    const scene = game.scene.scenes[0]; // Get current scene
    
    // Clear existing asteroids
    asteroids.forEach(asteroid => asteroid.destroy());
    asteroids = [];
    
    // Generate asteroids based on config
    for (let i = 0; i < GameConfig.WORLD.INITIAL_ASTEROIDS; i++) {
        // Choose random position away from ship
        let x, y;
        let tooClose = true;
        let attempts = 0;
        
        while (tooClose && attempts < 50) {
            x = Phaser.Math.Between(0, GameConfig.GAME_WIDTH);
            y = Phaser.Math.Between(0, GameConfig.GAME_HEIGHT);
            
            // Check distance from ship
            const distance = Phaser.Math.Distance.Between(
                x, y, 
                GameConfig.GAME_WIDTH / 2, 
                GameConfig.GAME_HEIGHT / 2
            );
            
            if (distance > GameConfig.WORLD.ASTEROID_SPAWN_DISTANCE) {
                tooClose = false;
            }
            attempts++;
        }
        
        // Choose random size
        const size = Phaser.Math.Between(GameConfig.ASTEROIDS.MIN_SIZE, GameConfig.ASTEROIDS.MAX_SIZE);
        
        // Choose material based on rarity
        const materialType = chooseMaterialType();
        
        // Create asteroid
        const asteroid = new Asteroid(scene, x, y, size, materialType);
        asteroids.push(asteroid);
    }
    
    console.log(`Generated ${asteroids.length} asteroids`);
}

function chooseMaterialType() {
    const random = Math.random();
    let cumulativeChance = 0;
    
    // Check each material type based on rarity
    for (let [materialName, materialData] of Object.entries(GameConfig.MATERIALS)) {
        cumulativeChance += materialData.rarity;
        if (random <= cumulativeChance) {
            return materialName;
        }
    }
    
    // Fallback to iron if something goes wrong
    return 'IRON';
}