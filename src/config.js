// Game configuration and constants for Void Miner
const GameConfig = {
    // Display settings
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    BACKGROUND_COLOR: 0x000000,
    
    // Physics settings
    SHIP: {
        ACCELERATION: 200,          // Ship thrust power
        MAX_SPEED: 300,            // Maximum ship velocity
        ROTATION_SPEED: 3,         // How fast ship rotates (radians/sec)
        SIZE: 15,                  // Ship size for collision detection
        FRICTION: 0.98             // Gradual speed reduction
    },
    
    ASTEROIDS: {
        MIN_SIZE: 20,              // Smallest asteroid radius
        MAX_SIZE: 60,              // Largest asteroid radius
        MIN_SPEED: 20,             // Minimum asteroid drift speed
        MAX_SPEED: 100,            // Maximum asteroid drift speed
        BREAK_SPEED: 50,           // Speed when asteroid breaks apart
        MIN_FRAGMENTS: 2,          // Min pieces when asteroid breaks
        MAX_FRAGMENTS: 4           // Max pieces when asteroid breaks
    },
    
    BULLETS: {
        SPEED: 400,                // Bullet velocity
        LIFETIME: 2000,            // Bullet duration in milliseconds
        SIZE: 3                    // Bullet radius
    },
    
    // Material types and colors
    MATERIALS: {
        IRON: {
            color: 0x808080,       // Grey
            value: 1,
            rarity: 0.6            // 60% of asteroids
        },
        CRYSTAL: {
            color: 0x00FFFF,       // Cyan
            value: 3,
            rarity: 0.3            // 30% of asteroids
        },
        GOLD: {
            color: 0xFFD700,       // Gold
            value: 10,
            rarity: 0.09           // 9% of asteroids
        },
        ENERGY: {
            color: 0xFF00FF,       // Magenta
            value: 50,
            rarity: 0.01           // 1% of asteroids - very rare!
        }
    },
    
    // Touch controls
    TOUCH: {
        JOYSTICK_RADIUS: 60,       // Virtual joystick size
        THRUST_BUTTON_SIZE: 80,    // Thrust button radius
        DEAD_ZONE: 10              // Minimum joystick movement
    },
    
    // World settings
    WORLD: {
        WRAP_PADDING: 50,          // Screen edge wrap buffer
        INITIAL_ASTEROIDS: 8,      // Starting number of asteroids
        ASTEROID_SPAWN_DISTANCE: 200 // Min distance from player when spawning
    },
    
    // UI Colors
    UI: {
        TEXT_COLOR: '#00FF00',     // Green terminal text
        WARNING_COLOR: '#FF0000',  // Red for warnings
        SUCCESS_COLOR: '#FFFF00'   // Yellow for success messages
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}