// Asteroid class for Void Miner
class Asteroid {
    constructor(scene, x, y, size, material) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.size = size;
        this.material = material;
        
        // Create physics body
        this.body = scene.physics.add.sprite(x, y, null);
        this.body.setVisible(false); // We'll draw it manually
        
        // Set collision bounds
        this.body.setCircle(size);
        
        // Generate random drift velocity
        const speed = Phaser.Math.Between(GameConfig.ASTEROIDS.MIN_SPEED, GameConfig.ASTEROIDS.MAX_SPEED);
        const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
        this.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Random rotation speed
        this.rotationSpeed = Phaser.Math.FloatBetween(-1, 1);
        this.rotation = 0;
        
        // Generate random asteroid shape
        this.generateShape();
        
        // Material properties
        this.materialData = GameConfig.MATERIALS[material];
    }
    
    generateShape() {
        // Create random polygon with 5-8 vertices
        const vertexCount = Phaser.Math.Between(5, 8);
        this.vertices = [];
        
        for (let i = 0; i < vertexCount; i++) {
            const angle = (i / vertexCount) * Math.PI * 2;
            // Add some randomness to make it look more natural
            const radius = this.size * Phaser.Math.FloatBetween(0.7, 1.0);
            const angleVariation = Phaser.Math.FloatBetween(-0.3, 0.3);
            
            this.vertices.push({
                x: Math.cos(angle + angleVariation) * radius,
                y: Math.sin(angle + angleVariation) * radius
            });
        }
    }
    
    update(graphics) {
        // Update rotation
        this.rotation += this.rotationSpeed * 0.01;
        
        // Handle screen wrapping
        this.wrapPosition();
        
        // Draw the asteroid
        this.draw(graphics);
    }
    
    draw(graphics) {
        // Set color based on material
        const color = this.materialData.color;
        const lineWidth = Math.max(1, Math.floor(this.size / 15));
        
        graphics.lineStyle(lineWidth, color);
        
        // Calculate rotated vertices
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const rotatedVertices = [];
        
        for (let vertex of this.vertices) {
            rotatedVertices.push({
                x: this.body.x + (vertex.x * cos - vertex.y * sin),
                y: this.body.y + (vertex.x * sin + vertex.y * cos)
            });
        }
        
        // Draw asteroid outline
        graphics.beginPath();
        graphics.moveTo(rotatedVertices[0].x, rotatedVertices[0].y);
        
        for (let i = 1; i < rotatedVertices.length; i++) {
            graphics.lineTo(rotatedVertices[i].x, rotatedVertices[i].y);
        }
        
        graphics.closePath();
        graphics.strokePath();
        
        // Add material-specific effects
        this.drawMaterialEffects(graphics, rotatedVertices);
    }
    
    drawMaterialEffects(graphics, vertices) {
        switch (this.material) {
            case 'CRYSTAL':
                // Add crystalline internal lines
                graphics.lineStyle(1, this.materialData.color, 0.5);
                const center = { x: this.body.x, y: this.body.y };
                
                // Draw lines from center to some vertices
                for (let i = 0; i < vertices.length; i += 2) {
                    graphics.beginPath();
                    graphics.moveTo(center.x, center.y);
                    graphics.lineTo(vertices[i].x, vertices[i].y);
                    graphics.strokePath();
                }
                break;
                
            case 'ENERGY':
                // Pulsing glow effect
                const pulseIntensity = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
                const glowColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    Phaser.Display.Color.ValueToColor(0x000000),
                    Phaser.Display.Color.ValueToColor(this.materialData.color),
                    1,
                    pulseIntensity
                );
                
                graphics.lineStyle(2, Phaser.Display.Color.GetColor(glowColor.r, glowColor.g, glowColor.b));
                graphics.strokeCircle(this.body.x, this.body.y, this.size * (0.8 + pulseIntensity * 0.3));
                break;
                
            case 'GOLD':
                // Add small dots to show metallic texture
                graphics.fillStyle(this.materialData.color, 0.8);
                for (let i = 0; i < 3; i++) {
                    const dotX = this.body.x + Math.cos(this.rotation + i * 2) * this.size * 0.3;
                    const dotY = this.body.y + Math.sin(this.rotation + i * 2) * this.size * 0.3;
                    graphics.fillCircle(dotX, dotY, 2);
                }
                break;
        }
    }
    
    wrapPosition() {
        const padding = GameConfig.WORLD.WRAP_PADDING;
        
        // Wrap horizontally
        if (this.body.x > GameConfig.GAME_WIDTH + padding) {
            this.body.x = -padding;
        } else if (this.body.x < -padding) {
            this.body.x = GameConfig.GAME_WIDTH + padding;
        }
        
        // Wrap vertically
        if (this.body.y > GameConfig.GAME_HEIGHT + padding) {
            this.body.y = -padding;
        } else if (this.body.y < -padding) {
            this.body.y = GameConfig.GAME_HEIGHT + padding;
        }
    }
    
    // Get collision bounds for physics
    getBounds() {
        return {
            x: this.body.x - this.size,
            y: this.body.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }
    
    // Destroy asteroid (for cleanup)
    destroy() {
        if (this.body) {
            this.body.destroy();
        }
    }
}