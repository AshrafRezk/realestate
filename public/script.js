// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('heroCanvas'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;

// Add fog for depth
scene.fog = new THREE.FogExp2(0x000000, 0.01);

// Mouse interaction variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraRotationSpeed = 0.5;
let cameraDistance = 50;
let cameraHeight = 30;
let cameraAngle = Math.PI / 4;

// Camera constraints
const MIN_CAMERA_HEIGHT = 20;
const MAX_CAMERA_HEIGHT = 60;
const MIN_CAMERA_DISTANCE = 30;
const MAX_CAMERA_DISTANCE = 80;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(140, 140);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Building positions (two buildings per grid square)
const buildingPositions = [
    // Top-left quadrant (z: -40 to 0, x: -40 to 0)
    { x: -30, z: -30, width: 8, height: 35, depth: 8 },  // Tall skyscraper
    { x: -10, z: -10, width: 12, height: 20, depth: 12 },  // Wide office building
    { x: -30, z: -10, width: 6, height: 25, depth: 6 },   // Medium residential
    { x: -10, z: -30, width: 9, height: 30, depth: 9 },   // Tall mixed-use
    
    // Top-center quadrant (z: -40 to 0, x: 0 to 40)
    { x: 10, z: -30, width: 7, height: 28, depth: 7 },    // Tall office
    { x: 30, z: -10, width: 10, height: 22, depth: 10 },  // Wide commercial
    { x: 10, z: -10, width: 8, height: 32, depth: 8 },    // Tall residential
    { x: 30, z: -30, width: 9, height: 26, depth: 9 },    // Medium office
    
    // Middle-left quadrant (z: 0 to 40, x: -40 to 0)
    { x: -30, z: 10, width: 11, height: 24, depth: 11 },  // Wide mixed-use
    { x: -10, z: 30, width: 7, height: 34, depth: 7 },    // Tall skyscraper
    { x: -30, z: 30, width: 8, height: 28, depth: 8 },    // Medium office
    { x: -10, z: 10, width: 10, height: 22, depth: 10 },  // Wide commercial
    
    // Middle-center quadrant (z: 0 to 40, x: 0 to 40)
    { x: 10, z: 10, width: 9, height: 30, depth: 9 },     // Tall mixed-use
    { x: 30, z: 30, width: 12, height: 25, depth: 12 },   // Wide office
    { x: 10, z: 30, width: 7, height: 35, depth: 7 },     // Tall skyscraper
    { x: 30, z: 10, width: 8, height: 27, depth: 8 }      // Medium residential
];

// Create streets (grid pattern)
function createStreets() {
    const streetGroup = new THREE.Group();
    
    // Create road material
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Create lane line material
    const laneLineMaterial = new THREE.MeshStandardMaterial({
        color: 0xF0C96B,
        emissive: 0xF0C96B,
        emissiveIntensity: 0.2,
        roughness: 0.2,
        metalness: 0.8
    });
    
    // Create main roads
    const roadWidth = 4;
    const laneLineWidth = 0.2;
    
    // Main horizontal roads
    const horizontalRoads = [
        { z: -40, length: 140 }, // Top horizontal
        { z: 0, length: 140 },   // Center horizontal
        { z: 40, length: 140 }   // Bottom horizontal
    ];
    
    horizontalRoads.forEach(road => {
        // Create road
        const horizontalRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(road.length, roadWidth),
            roadMaterial
        );
        horizontalRoad.rotation.x = -Math.PI / 2;
        horizontalRoad.position.set(0, 0.01, road.z);
        horizontalRoad.userData = { isStreet: true };
        streetGroup.add(horizontalRoad);
        
        // Create lane line
        const laneLine = new THREE.Mesh(
            new THREE.PlaneGeometry(road.length, laneLineWidth),
            laneLineMaterial
        );
        laneLine.rotation.x = -Math.PI / 2;
        laneLine.position.set(0, 0.02, road.z);
        streetGroup.add(laneLine);
    });
    
    // Main vertical roads
    const verticalRoads = [
        { x: -40, length: 140 }, // Left vertical
        { x: 0, length: 140 },   // Center vertical
        { x: 40, length: 140 }   // Right vertical
    ];
    
    verticalRoads.forEach(road => {
        // Create road
        const verticalRoad = new THREE.Mesh(
            new THREE.PlaneGeometry(road.length, roadWidth),
            roadMaterial
        );
        verticalRoad.rotation.x = -Math.PI / 2;
        verticalRoad.rotation.z = Math.PI / 2;
        verticalRoad.position.set(road.x, 0.01, 0);
        verticalRoad.userData = { isStreet: true };
        streetGroup.add(verticalRoad);
        
        // Create lane line
        const laneLine = new THREE.Mesh(
            new THREE.PlaneGeometry(road.length, laneLineWidth),
            laneLineMaterial
        );
        laneLine.rotation.x = -Math.PI / 2;
        laneLine.rotation.z = Math.PI / 2;
        laneLine.position.set(road.x, 0.02, 0);
        streetGroup.add(laneLine);
    });
    
    scene.add(streetGroup);
    return streetGroup;
}

// Create buildings
function createBuildings() {
    const buildingGroup = new THREE.Group();
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.3
    });

    // Window material
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xF0C96B,
        emissive: 0xF0C96B,
        emissiveIntensity: 0.2,
        roughness: 0.2,
        metalness: 0.8
    });

    // Function to create windows for a building
    function createWindows(building, width, height, depth) {
        const windowGroup = new THREE.Group();
        
        // Calculate window size based on building dimensions
        const windowSize = Math.min(width, depth) * 0.15;
        const windowSpacing = windowSize * 1.2;
        const margin = windowSize * 0.5;
        
        // Calculate number of windows based on building size
        const windowsX = Math.max(2, Math.floor((width - margin * 2) / (windowSize + windowSpacing)));
        const windowsZ = Math.max(2, Math.floor((depth - margin * 2) / (windowSize + windowSpacing)));
        const windowsY = Math.max(3, Math.floor((height - margin * 2) / (windowSize + windowSpacing)));
        
        // Calculate total space needed for windows
        const totalWidth = windowsX * windowSize + (windowsX - 1) * windowSpacing;
        const totalDepth = windowsZ * windowSize + (windowsZ - 1) * windowSpacing;
        const totalHeight = windowsY * windowSize + (windowsY - 1) * windowSpacing;
        
        // Calculate starting positions to center the windows
        const startX = -totalWidth / 2;
        const startZ = -totalDepth / 2;
        const startY = -totalHeight / 2;
        
        // Create window geometry
        const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
        
        // Create windows on each face
        for (let y = 0; y < windowsY; y++) {
            for (let x = 0; x < windowsX; x++) {
                // Front face
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    startX + x * (windowSize + windowSpacing) + windowSize/2,
                    startY + y * (windowSize + windowSpacing) + windowSize/2,
                    depth/2 + 0.05
                );
                frontWindow.userData = { isWindow: true };
                windowGroup.add(frontWindow);
                
                // Back face
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    startX + x * (windowSize + windowSpacing) + windowSize/2,
                    startY + y * (windowSize + windowSpacing) + windowSize/2,
                    -depth/2 - 0.05
                );
                backWindow.userData = { isWindow: true };
                windowGroup.add(backWindow);
            }
        }
        
        // Create windows on sides
        for (let y = 0; y < windowsY; y++) {
            for (let z = 0; z < windowsZ; z++) {
                // Left face
                const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                leftWindow.position.set(
                    -width/2 - 0.05,
                    startY + y * (windowSize + windowSpacing) + windowSize/2,
                    startZ + z * (windowSize + windowSpacing) + windowSize/2
                );
                leftWindow.rotation.y = Math.PI / 2;
                leftWindow.userData = { isWindow: true };
                windowGroup.add(leftWindow);
                
                // Right face
                const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                rightWindow.position.set(
                    width/2 + 0.05,
                    startY + y * (windowSize + windowSpacing) + windowSize/2,
                    startZ + z * (windowSize + windowSpacing) + windowSize/2
                );
                rightWindow.rotation.y = Math.PI / 2;
                rightWindow.userData = { isWindow: true };
                windowGroup.add(rightWindow);
            }
        }
        
        return windowGroup;
    }
    
    buildingPositions.forEach(pos => {
        const geometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
        const building = new THREE.Mesh(geometry, buildingMaterial);
        
        // Position building
        building.position.set(pos.x, pos.height / 2, pos.z);
        
        // Add collision data
        building.userData = {
            isBuilding: true,
            width: pos.width,
            height: pos.height,
            depth: pos.depth
        };
        
        // Enable shadows
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Create and add windows
        const windows = createWindows(building, pos.width, pos.height, pos.depth);
        building.add(windows);
        
        buildingGroup.add(building);
    });
    
    scene.add(buildingGroup);
    return buildingGroup;
}

// Create trees
function createTrees() {
    const treeGroup = new THREE.Group();
    
    // Tree materials
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.8,
        metalness: 0.1
    });

    // Tree positions along roads (on the sides)
    const treePositions = [
        // Along horizontal roads (top side)
        { x: -50, z: -45 }, { x: -30, z: -45 }, { x: -10, z: -45 },
        { x: 10, z: -45 }, { x: 30, z: -45 }, { x: 50, z: -45 },
        // Along horizontal roads (bottom side)
        { x: -50, z: 45 }, { x: -30, z: 45 }, { x: -10, z: 45 },
        { x: 10, z: 45 }, { x: 30, z: 45 }, { x: 50, z: 45 },
        // Along vertical roads (left side)
        { x: -45, z: -50 }, { x: -45, z: -30 }, { x: -45, z: -10 },
        { x: -45, z: 10 }, { x: -45, z: 30 }, { x: -45, z: 50 },
        // Along vertical roads (right side)
        { x: 45, z: -50 }, { x: 45, z: -30 }, { x: 45, z: -10 },
        { x: 45, z: 10 }, { x: 45, z: 30 }, { x: 45, z: 50 }
    ];

    // Function to check if a position overlaps with any building
    function checkBuildingOverlap(x, z) {
        const TREE_RADIUS = 2;
        for (const building of buildingPositions) {
            const buildingHalfWidth = building.width / 2;
            const buildingHalfDepth = building.depth / 2;
            
            if (Math.abs(x - building.x) < (buildingHalfWidth + TREE_RADIUS) &&
                Math.abs(z - building.z) < (buildingHalfDepth + TREE_RADIUS)) {
                return true;
            }
        }
        return false;
    }

    treePositions.forEach(pos => {
        if (checkBuildingOverlap(pos.x, pos.z)) {
            return;
        }

        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 2, 0);
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // Create leaves
        const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, 6, 0);
        leaves.castShadow = true;
        leaves.receiveShadow = true;

        // Group trunk and leaves
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        tree.position.set(pos.x, 0, pos.z);
        tree.userData = { 
            isTree: true, 
            collisionRadius: 2,
            position: new THREE.Vector3(pos.x, 0, pos.z)
        };
        
        treeGroup.add(tree);
    });

    scene.add(treeGroup);
    return treeGroup;
}

// Create light poles
function createLightPoles() {
    const poleGroup = new THREE.Group();
    
    // Pole materials
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.3
    });
    
    const bulbMaterial = new THREE.MeshStandardMaterial({
        color: 0xF0C96B,
        emissive: 0xF0C96B,
        emissiveIntensity: 1,
        roughness: 0.2,
        metalness: 0.8
    });

    // Light pole positions along roads (on the sides)
    const polePositions = [
        // Along horizontal roads (top side)
        { x: -60, z: -45 }, { x: -20, z: -45 }, { x: 20, z: -45 }, { x: 60, z: -45 },
        // Along horizontal roads (bottom side)
        { x: -60, z: 45 }, { x: -20, z: 45 }, { x: 20, z: 45 }, { x: 60, z: 45 },
        // Along vertical roads (left side)
        { x: -45, z: -60 }, { x: -45, z: -20 }, { x: -45, z: 20 }, { x: -45, z: 60 },
        // Along vertical roads (right side)
        { x: 45, z: -60 }, { x: 45, z: -20 }, { x: 45, z: 20 }, { x: 45, z: 60 }
    ];

    // Function to check if a position overlaps with any building
    function checkPoleOverlap(x, z) {
        const POLE_RADIUS = 0.3;
        for (const building of buildingPositions) {
            const buildingHalfWidth = building.width / 2;
            const buildingHalfDepth = building.depth / 2;
            
            if (Math.abs(x - building.x) < (buildingHalfWidth + POLE_RADIUS) &&
                Math.abs(z - building.z) < (buildingHalfDepth + POLE_RADIUS)) {
                return true;
            }
        }
        return false;
    }

    polePositions.forEach(pos => {
        if (checkPoleOverlap(pos.x, pos.z)) {
            return;
        }

        // Create pole
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 8);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(0, 4, 0);
        pole.castShadow = true;
        pole.receiveShadow = true;

        // Create bulb
        const bulbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(0, 8, 0);

        // Create light
        const light = new THREE.PointLight(0xF0C96B, 1, 10);
        light.position.set(0, 8, 0);

        // Group pole, bulb, and light
        const lightPole = new THREE.Group();
        lightPole.add(pole);
        lightPole.add(bulb);
        lightPole.add(light);
        lightPole.position.set(pos.x, 0, pos.z);
        lightPole.userData = { 
            isPole: true, 
            collisionRadius: 0.3,
            position: new THREE.Vector3(pos.x, 0, pos.z)
        };
        
        poleGroup.add(lightPole);
    });

    scene.add(poleGroup);
    return poleGroup;
}

// Initialize scene elements
const streets = createStreets();
const buildings = createBuildings();
const trees = createTrees();
const lightPoles = createLightPoles();

// Update camera position based on angle and height
function updateCameraPosition() {
    cameraHeight = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, cameraHeight));
    cameraDistance = Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, cameraDistance));
    
    camera.position.x = cameraDistance * Math.cos(cameraAngle);
    camera.position.z = cameraDistance * Math.sin(cameraAngle);
    camera.position.y = cameraHeight;
    camera.lookAt(0, 0, 0);
}

// Initial camera position
updateCameraPosition();

// Mouse event handlers
function onMouseDown(event) {
    if (!isMouseOverCanvas) return;
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

function onMouseMove(event) {
    if (isDragging && isMouseOverCanvas) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        cameraAngle += deltaMove.x * cameraRotationSpeed * 0.01;
        cameraHeight = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, cameraHeight - deltaMove.y * 0.1));
        
        updateCameraPosition();
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

// Add mouse wheel event for zoom control
function onMouseWheel(event) {
    if (!isMouseOverCanvas) return;
    
    event.preventDefault();
    
    const zoomSpeed = 0.5;
    cameraDistance += event.deltaY * zoomSpeed * 0.01;
    
    updateCameraPosition();
}

// Add event listeners
const canvas = document.getElementById('heroCanvas');
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('wheel', onMouseWheel, { passive: false });

// --- Mobile Touch Controls ---
let lastTouchDist = null;
let lastTouchPos = null;

canvas.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    // One finger: start drag
    lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    // Two fingers: start pinch
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.sqrt(dx * dx + dy * dy);
  }
}, { passive: false });

canvas.addEventListener('touchmove', function(e) {
  if (e.touches.length === 1 && lastTouchPos) {
    // One finger drag: orbit
    e.preventDefault();
    const deltaX = e.touches[0].clientX - lastTouchPos.x;
    const deltaY = e.touches[0].clientY - lastTouchPos.y;
    cameraAngle += deltaX * cameraRotationSpeed * 0.01;
    cameraHeight = Math.max(MIN_CAMERA_HEIGHT, Math.min(MAX_CAMERA_HEIGHT, cameraHeight - deltaY * 0.1));
    updateCameraPosition();
    lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    // Two finger pinch: zoom
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastTouchDist !== null) {
      const delta = dist - lastTouchDist;
      cameraDistance += -delta * 0.05; // Pinch in/out to zoom
      updateCameraPosition();
    }
    lastTouchDist = dist;
  }
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
  if (e.touches.length < 2) {
    lastTouchDist = null;
  }
  if (e.touches.length === 0) {
    lastTouchPos = null;
  }
}, { passive: false });

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse spotlight
let mouseSpotlight;
const spotlightColor = 0xF0C96B;
let isMouseOverCanvas = false;

function createMouseSpotlight() {
    mouseSpotlight = new THREE.SpotLight(spotlightColor, 2, 100, Math.PI / 8, 0.2, 1);
    mouseSpotlight.position.set(0, 50, 0);
    mouseSpotlight.castShadow = true;
    mouseSpotlight.shadow.mapSize.width = 1024;
    mouseSpotlight.shadow.mapSize.height = 1024;
    mouseSpotlight.shadow.camera.near = 0.5;
    mouseSpotlight.shadow.camera.far = 100;
    scene.add(mouseSpotlight);

    const lightCone = new THREE.Mesh(
        new THREE.ConeGeometry(10, 50, 32),
        new THREE.MeshBasicMaterial({
            color: spotlightColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        })
    );
    lightCone.rotation.x = Math.PI / 2;
    lightCone.position.y = 25;
    mouseSpotlight.add(lightCone);
}

// Update spotlight position based on mouse
function updateSpotlightPosition(event) {
    if (!isMouseOverCanvas) return;

    const canvas = document.getElementById('heroCanvas');
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersection);

    if (intersection) {
        if (window.innerWidth <= 768 && event.type.startsWith('touch')) {
            // Mobile: animate spotlight smoothly to new position
            const start = mouseSpotlight.position.clone();
            const end = new THREE.Vector3(intersection.x, 50, intersection.z);
            const startTarget = mouseSpotlight.target.position.clone();
            const endTarget = intersection.clone();
            let t = 0;
            const duration = 300; // ms
            const startTime = performance.now();
            function animateSpotlight(now) {
                t = Math.min(1, (now - startTime) / duration);
                mouseSpotlight.position.lerpVectors(start, end, t);
                mouseSpotlight.target.position.lerpVectors(startTarget, endTarget, t);
                mouseSpotlight.target.updateMatrixWorld();
                if (t < 1) {
                    requestAnimationFrame(animateSpotlight);
                } else {
                    mouseSpotlight.position.copy(end);
                    mouseSpotlight.target.position.copy(endTarget);
                    mouseSpotlight.target.updateMatrixWorld();
                }
            }
            requestAnimationFrame(animateSpotlight);
        } else {
            // Desktop: instant move
            mouseSpotlight.position.set(
                intersection.x,
                50,
                intersection.z
            );
            mouseSpotlight.target.position.copy(intersection);
            mouseSpotlight.target.updateMatrixWorld();
        }
    }
}

// Hide cursor and initialize spotlight
function initMouseSpotlight() {
    const canvas = document.getElementById('heroCanvas');
    
    canvas.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'none';
        isMouseOverCanvas = true;
    });
    
    canvas.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'auto';
        isMouseOverCanvas = false;
        mouseSpotlight.position.set(0, -100, 0);
    });
    
    createMouseSpotlight();
    canvas.addEventListener('mousemove', updateSpotlightPosition);
}

// Initialize mouse spotlight
initMouseSpotlight();

// On mobile, animate spotlight on tap
if (window.innerWidth <= 768) {
    const canvas = document.getElementById('heroCanvas');
    canvas.addEventListener('touchstart', function(e) {
        updateSpotlightPosition(e);
    }, { passive: false });
}

// --- BEGIN: Real Estate Results Logic ---
let allUnits = [];
let currentView = 'grid';
let currentPage = 1;
const GRID_UNITS_PER_PAGE = 12; // 3 rows x 4 columns
const LIST_UNITS_PER_PAGE = 3;  // 3 rows

document.addEventListener('DOMContentLoaded', function () {
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Add view switching functionality
  gridViewBtn.addEventListener('click', function() {
    currentView = 'grid';
    gridViewBtn.style.background = '#F6D984';
    gridViewBtn.style.color = '#181818';
    listViewBtn.style.background = '#222';
    listViewBtn.style.color = '#F6D984';
    renderUnits(allUnits, true);
  });

  listViewBtn.addEventListener('click', function() {
    currentView = 'list';
    listViewBtn.style.background = '#F6D984';
    listViewBtn.style.color = '#181818';
    gridViewBtn.style.background = '#222';
    gridViewBtn.style.color = '#F6D984';
    renderUnits(allUnits, true);
  });

  function showToast(message, type = 'success') {
    if (window.Toastify) {
      Toastify({
        text: message,
        duration: 3500,
        gravity: "top",
        position: "right",
        className: type,
        style: {
          background: type === 'error' ? "#b91c1c" : "#232323",
          color: "#F6D984",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "1rem",
          boxShadow: "0 4px 24px #0008",
          border: "1.5px solid #F6D984"
        }
      }).showToast();
    }
  }

  function renderUnits(units, withAnimation = false) {
    if (!units || units.length === 0) {
      resultsContainer.innerHTML = '<p class="text-center text-gray-400 col-span-full">No matching units found. Try adjusting your search criteria.</p>';
      document.getElementById('paginationControls')?.remove();
      document.getElementById('pageIndicator')?.remove();
      return;
    }

    // Animation logic
    if (withAnimation) {
      resultsContainer.classList.add('fade-out');
      setTimeout(() => {
        actuallyRenderUnits(units);
        resultsContainer.classList.remove('fade-out');
        resultsContainer.classList.add('fade-in');
        setTimeout(() => {
          resultsContainer.classList.remove('fade-in');
        }, 400);
      }, 400);
      return;
    }
    actuallyRenderUnits(units);
  }

  function actuallyRenderUnits(units) {
    // Determine units per page based on view
    let UNITS_PER_PAGE;
    if (window.innerWidth <= 768) {
      UNITS_PER_PAGE = currentView === 'grid' ? 4 : 3; // 2x2 for grid, 3 for list
    } else {
      UNITS_PER_PAGE = currentView === 'grid' ? GRID_UNITS_PER_PAGE : LIST_UNITS_PER_PAGE;
    }
    const totalPages = Math.ceil(units.length / UNITS_PER_PAGE);
    if (currentPage > totalPages) currentPage = 1;
    const startIdx = (currentPage - 1) * UNITS_PER_PAGE;
    const endIdx = startIdx + UNITS_PER_PAGE;
    const paginatedUnits = units.slice(startIdx, endIdx);

    // Remove old pagination controls and page indicator if any
    document.getElementById('paginationControls')?.remove();
    document.getElementById('pageIndicator')?.remove();

    // Create and insert centered page indicator above results
    let pageIndicator = document.createElement('div');
    pageIndicator.id = 'pageIndicator';
    pageIndicator.style.textAlign = 'center';
    pageIndicator.style.color = '#F6D984';
    pageIndicator.style.fontWeight = '600';
    pageIndicator.style.fontSize = '1.1rem';
    pageIndicator.style.margin = '0 0 16px 0';
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    resultsContainer.parentNode.insertBefore(pageIndicator, resultsContainer);

    // Create pagination arrows (no page text)
    let pagination = document.createElement('div');
    pagination.id = 'paginationControls';
    pagination.style.display = 'flex';
    pagination.style.justifyContent = 'space-between';
    pagination.style.alignItems = 'center';
    pagination.style.width = '100%';
    pagination.style.position = 'relative';
    pagination.style.margin = '0 0 24px 0';
    pagination.innerHTML = `
      <button id="prevPageBtn" ${currentPage === 1 ? 'disabled' : ''} style="background: none; border: none; color: #F6D984; font-size: 2.2rem; cursor: pointer; padding: 0 16px; position: absolute; left: 0; top: 50%; transform: translateY(-50%);">
        &#8592;
      </button>
      <button id="nextPageBtn" ${currentPage === totalPages ? 'disabled' : ''} style="background: none; border: none; color: #F6D984; font-size: 2.2rem; cursor: pointer; padding: 0 16px; position: absolute; right: 0; top: 50%; transform: translateY(-50%);">
        &#8594;
      </button>
    `;
    // Insert pagination above results (but below page indicator)
    resultsContainer.parentNode.insertBefore(pagination, resultsContainer);

    document.getElementById('prevPageBtn').onclick = () => { currentPage--; renderUnits(units, true); };
    document.getElementById('nextPageBtn').onclick = () => { currentPage++; renderUnits(units, true); };

    if (currentView === 'grid') {
      resultsContainer.classList.remove('flex-list-mobile');
      if (window.innerWidth <= 768) {
        // Mobile grid: 2 columns
        resultsContainer.style.display = 'grid';
        resultsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        resultsContainer.style.justifyContent = '';
        resultsContainer.style.alignItems = '';
        resultsContainer.style.gap = '10px';
      } else {
        // Desktop grid: 4 columns
        resultsContainer.style.display = 'grid';
        resultsContainer.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
        resultsContainer.style.justifyContent = '';
        resultsContainer.style.alignItems = '';
        resultsContainer.style.gap = '32px';
      }
      resultsContainer.innerHTML = paginatedUnits.map(unit => `
        <div class='gallery-item card-lux p-0 overflow-hidden relative' style="background: #232323; border-radius: 16px; box-shadow: 0 4px 24px #0006; width: 100%; margin: 0; transition: box-shadow 0.2s; border: 1.5px solid #F6D984;">
          <div class='gallery-content p-6'>
            <h3 class='text-xl font-bold highlight mb-2' style="color: #F6D984;">${unit.Complete_Name__c || unit.Name}</h3>
            <p class='text-sm text-gray-400 mb-1'>${unit.Location__c || ''}</p>
            <div class='flex items-center gap-4 mb-4'>
              <span class='text-sm'>${unit.Bedrooms__c || '-'} BR</span>
              <span class='text-sm'>${unit.Bathrooms__c || '-'} BA</span>
              <span class='text-sm'>${unit.Garden_Area__c ? unit.Garden_Area__c + 'm² Garden' : 'No Garden'}</span>
            </div>
            <p class='text-2xl font-bold highlight' style="color: #F6D984;">$${unit.Price__c ? unit.Price__c.toLocaleString() : '-'}</p>
          </div>
        </div>
      `).join('');
    } else {
      if (window.innerWidth <= 768) {
        resultsContainer.classList.add('flex-list-mobile');
      } else {
        resultsContainer.classList.remove('flex-list-mobile');
      }
      // List view: 1 per row, 3 rows, full width on mobile
      resultsContainer.style.display = 'flex';
      resultsContainer.style.flexDirection = 'column';
      resultsContainer.style.alignItems = 'center';
      resultsContainer.style.justifyContent = '';
      resultsContainer.style.gap = window.innerWidth <= 768 ? '10px' : '16px';
      resultsContainer.innerHTML = paginatedUnits.map(unit => `
        <div class='gallery-item card-lux p-0 overflow-hidden relative' style="background: #232323; border-radius: 16px; box-shadow: 0 4px 24px #0006; width: 100%; max-width: ${window.innerWidth <= 768 ? '100vw' : '700px'}; margin: 0 auto; transition: box-shadow 0.2s; border: 1.5px solid #F6D984;">
          <div class='gallery-content p-6${window.innerWidth > 768 ? ' d-flex justify-content-between align-items-center' : ''}'>
            <div>
              <h3 class='text-xl font-bold highlight mb-2' style="color: #F6D984;">${unit.Complete_Name__c || unit.Name}</h3>
              <p class='text-sm text-gray-400 mb-1'>${unit.Location__c || ''}</p>
              <div class='flex items-center gap-4'>
                <span class='text-sm'>${unit.Bedrooms__c || '-'} BR</span>
                <span class='text-sm'>${unit.Bathrooms__c || '-'} BA</span>
                <span class='text-sm'>${unit.Garden_Area__c ? unit.Garden_Area__c + 'm² Garden' : 'No Garden'}</span>
              </div>
            </div>
            <p class='text-2xl font-bold highlight m-0' style="color: #F6D984;">$${unit.Price__c ? unit.Price__c.toLocaleString() : '-'}</p>
          </div>
        </div>
      `).join('');
    }

    setTimeout(() => {
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    }, 100);
  }

  async function fetchAllUnits() {
    try {
      loadingIndicator.style.display = 'block';
      resultsContainer.style.display = 'none';
      const response = await fetch('/api/units');
      if (!response.ok) throw new Error('Failed to fetch units');
      allUnits = await response.json();
      loadingIndicator.style.display = 'none';
      resultsContainer.style.display = 'flex';
      renderUnits(allUnits);
      showToast(`Loaded ${allUnits.length} available units`, 'success');
    } catch (error) {
      loadingIndicator.style.display = 'none';
      resultsContainer.style.display = 'flex';
      resultsContainer.innerHTML = '<p class="text-center text-danger">Failed to load units.</p>';
      showToast('Failed to load units. Please try again later.', 'error');
      console.error('Fetch error:', error);
    }
  }

  // Filtering logic for the search form
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  document.getElementById('filterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    currentPage = 1;
    const budget = document.getElementById('budget').value;
    const rooms = document.getElementById('rooms').value;
    const delivery = document.getElementById('delivery').value;
    const areaInput = document.getElementById('area').value.trim().toLowerCase();
    const filteredUnits = allUnits.filter(unit => {
      if (budget && unit.Price__c > parseFloat(budget)) return false;
      if (rooms && unit.Bedrooms__c < parseInt(rooms)) return false;
      if (delivery && new Date(unit.Delivery_Date__c) > new Date(delivery)) return false;
      if (areaInput) {
        const coords = areaInput.split(',');
        if (coords.length === 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            if (!unit.Location__c || 
                calculateDistance(
                  unit.Location__c.latitude, 
                  unit.Location__c.longitude, 
                  lat, 
                  lng
                ) > 10) {
              return false;
            }
            return true;
          }
        }
        if (!unit.Complete_Name__c || 
            !unit.Complete_Name__c.toLowerCase().includes(areaInput)) {
          return false;
        }
      }
      return true;
    });
    renderUnits(filteredUnits, true);
    showToast(`Found ${filteredUnits.length} matching units`, filteredUnits.length ? 'success' : 'error');
    // Scroll to results section with smooth animation
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Add clear search button logic
  document.getElementById('clearSearchBtn').addEventListener('click', function () {
    // Reset all form fields
    document.getElementById('budget').value = '';
    document.getElementById('rooms').value = '';
    document.getElementById('delivery').value = '';
    document.getElementById('area').value = '';
    // Reset results to show all units with animation
    currentPage = 1;
    renderUnits(allUnits, true);
    showToast(`Showing all available units`, 'success');
    // Scroll to results section with smooth animation
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Initial load
  fetchAllUnits();
  // Set grid view as default visually
  gridViewBtn.style.background = '#F6D984';
  gridViewBtn.style.color = '#181818';
  listViewBtn.style.background = '#222';
  listViewBtn.style.color = '#F6D984';

  // On page load, add fade-anim class to resultsContainer
  resultsContainer.classList.add('fade-anim');
});
// --- END: Real Estate Results Logic ---

// --- BEGIN: Desktop Switch Logic ---
document.addEventListener('DOMContentLoaded', function () {
  const metaViewport = document.querySelector('meta[name="viewport"]');
  const modalEl = document.getElementById('desktopPromptModal');
  const minDesktopWidth = 992; // threshold larger than typical tablet

  function setMobileViewport() {
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=768, initial-scale=1.0, user-scalable=yes');
    }
  }

  function setDesktopViewport() {
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
    }
  }

  if (window.innerWidth > minDesktopWidth) {
    setMobileViewport();
    setTimeout(() => {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      document.getElementById('switchDesktopBtn').addEventListener('click', () => {
        setDesktopViewport();
        modal.hide();
      });

      document.getElementById('stayMobileBtn').addEventListener('click', () => {
        modal.hide();
      });
    }, 20000);
  }
});
// --- END: Desktop Switch Logic ---

// --- BEGIN: Feature Progress Animation ---
document.addEventListener('DOMContentLoaded', () => {
  const fills = document.querySelectorAll('.progress-fill');
  const nums = document.querySelectorAll('.progress-num');

  fills.forEach(fill => {
    const target = parseInt(fill.dataset.target, 10) || 0;
    // trigger width animation after slight delay
    setTimeout(() => {
      fill.style.width = `${target}%`;
    }, 500);
  });

  nums.forEach(num => {
    const target = parseInt(num.dataset.target, 10) || 0;
    let count = 0;

    const step = () => {
      num.textContent = `${count}%`;
      if (count < target) {
        count++;
        requestAnimationFrame(step);
      }
    };
    step();
  });
});
// --- END: Feature Progress Animation ---
