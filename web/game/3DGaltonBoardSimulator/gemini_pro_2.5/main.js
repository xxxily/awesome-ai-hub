import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.19.0/dist/cannon-es.js';
// Note: OrbitControls isn't an ES6 module in this CDN version, access via THREE.OrbitControls
// import { OrbitControls } from '...'; // If using a module version

// --- Configuration ---
const config = {
    debugPhysics: false, // Set to true to see physics wireframes
    pegRows: 10,
    pegRadius: 0.1,
    pegHeight: 0.3,
    pegSpacingH: 0.8, // Horizontal spacing
    pegSpacingV: 0.7, // Vertical spacing
    ballRadius: 0.15,
    ballMass: 0.1,
    dropHeightOffset: 1.0, // How far above the top peg to drop balls
    binWidth: 0.8, // Should match pegSpacingH
    binHeight: 2.0,
    binWallThickness: 0.1,
    boardWidthMargin: 0.5, // Extra space on sides
    physicsTimeStep: 1 / 60, // seconds
    ballSettleVelocityThreshold: 0.1, // Velocity below which a ball is considered settled
    ballSettleYThreshold: -4.5, // Y-position below which balls are checked for settling (adjust based on board size)
    addBallInterval: 50, // Milliseconds between adding balls when clicking button
};

// --- Global Variables ---
let scene, camera, renderer, controls;
let world, physicsDebugger;
let balls = []; // Store { mesh, body } objects
let staticMeshes = []; // Store meshes for board elements
let binCounts = [];
let totalBallsDropped = 0;
let chart;
let boardElements = []; // Store physics bodies of the board for reset

// --- DOM Elements ---
const sceneContainer = document.getElementById('sceneContainer');
const addBallsButton = document.getElementById('addBallsButton');
const resetButton = document.getElementById('resetButton');
const numBallsToAddInput = document.getElementById('numBallsToAdd');
const totalBallsDisplay = document.getElementById('totalBallsDisplay');
const pegRowsDisplay = document.getElementById('pegRowsDisplay');
const chartCanvas = document.getElementById('distributionChart');

// --- Initialization ---
function init() {
    initThree();
    initCannon();
    initChart();
    createBoard();
    setupEventListeners();
    pegRowsDisplay.textContent = config.pegRows; // Display initial peg rows
    animate();
}

// --- Three.js Setup ---
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
     // Adjust camera position based on board size
    camera.position.set(0, config.pegRows * config.pegSpacingV * 0.3, config.pegRows * 1.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    renderer.shadowMap.enabled = true; // Enable shadows for better depth perception
    sceneContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true; // Allow light to cast shadows
    // Configure shadow properties (optional, adjust for quality/performance)
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);


    // Controls
    // Ensure THREE.OrbitControls is loaded (see HTML)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 50;
     controls.target.set(0, -config.pegRows * config.pegSpacingV * 0.2, 0); // Aim controls towards board center
     controls.update();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// --- Cannon-es (Physics) Setup ---
function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Standard gravity
    world.broadphase = new CANNON.NaiveBroadphase(); // Simple broadphase
    // world.solver.iterations = 10; // Adjust solver iterations if needed

    // Define materials
    const ballMaterial = new CANNON.Material('ballMaterial');
    const pegMaterial = new CANNON.Material('pegMaterial');
    const wallMaterial = new CANNON.Material('wallMaterial');

    // Define contact properties (bounciness, friction)
    const ballPegContact = new CANNON.ContactMaterial(ballMaterial, pegMaterial, {
        friction: 0.1, // Low friction
        restitution: 0.5, // Moderate bounciness
    });
    world.addContactMaterial(ballPegContact);

    const ballWallContact = new CANNON.ContactMaterial(ballMaterial, wallMaterial, {
        friction: 0.05,
        restitution: 0.4,
    });
    world.addContactMaterial(ballWallContact);

     // Ground plane (optional but catches stray balls)
     const groundShape = new CANNON.Plane();
     const groundBody = new CANNON.Body({ mass: 0, material: wallMaterial }); // Static
     groundBody.addShape(groundShape);
     groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // Rotate to be horizontal
     groundBody.position.y = config.ballSettleYThreshold - config.binHeight - 1; // Place below bins
     world.addBody(groundBody);
     boardElements.push(groundBody); // Add to list for reset

     if (config.debugPhysics) {
         // requires cannon-es-debugger
         // You might need to import it separately if using modules
         // import CannonDebugger from 'cannon-es-debugger';
         // physicsDebugger = new CannonDebugger(scene, world.bodies);
         console.warn("Physics debugger requested but not fully implemented in this example without importing 'cannon-es-debugger'.");
     }
}

// --- Chart.js Setup ---
function initChart() {
    const numBins = config.pegRows + 1;
    binCounts = new Array(numBins).fill(0);
    const binLabels = Array.from({ length: numBins }, (_, i) => i - Math.floor(config.pegRows / 2)); // Labels like -N/2 ... 0 ... N/2

    const ctx = chartCanvas.getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [
                {
                    label: '实际分布 (球数)',
                    data: binCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue bars
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '理论二项分布',
                    data: calculateTheoreticalDistribution(0), // Start with 0 balls
                    type: 'line', // Overlay as a line chart
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)', // Red line
                    tension: 0.1 // Slight curve
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: '小球数量' }
                },
                x: {
                    title: { display: true, text: '落点槽位 (中心为 0)' }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '高尔顿板小球分布'
                },
                tooltip: {
                   callbacks: {
                        label: function(context) {
                             let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Show integer for bars, potentially float for line
                                if (context.dataset.type === 'line') {
                                    label += context.parsed.y.toFixed(2);
                                } else {
                                     label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// --- Create Board Elements (Visual + Physics) ---
function createBoard() {
    const pegGeometry = new THREE.CylinderGeometry(config.pegRadius, config.pegRadius, config.pegHeight, 16);
    const pegMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const pegShape = new CANNON.Cylinder(config.pegRadius, config.pegRadius, config.pegHeight, 16);
    const pegPhysicsMaterial = world.materials.find(m => m.name === 'pegMaterial'); // Get reference

    const boardCenterOffset = (config.pegRows * config.pegSpacingH) / 2;

    // Create Pegs
    for (let i = 0; i < config.pegRows; i++) {
        const yPos = -(i * config.pegSpacingV);
        const numPegsInRow = i + 1;
        const rowWidth = i * config.pegSpacingH;
        const startX = -rowWidth / 2;

        for (let j = 0; j < numPegsInRow; j++) {
            const xPos = startX + j * config.pegSpacingH;

            // Visual Peg
            const pegMesh = new THREE.Mesh(pegGeometry, pegMaterial);
            pegMesh.position.set(xPos, yPos, 0);
            pegMesh.castShadow = true;
            pegMesh.receiveShadow = true;
            scene.add(pegMesh);
            staticMeshes.push(pegMesh);

            // Physics Peg
            const pegBody = new CANNON.Body({
                mass: 0, // Static
                shape: pegShape,
                position: new CANNON.Vec3(xPos, yPos, 0),
                material: pegPhysicsMaterial
            });
            world.addBody(pegBody);
            boardElements.push(pegBody);
        }
    }

     // Create Bins at the bottom
    const binYPos = -(config.pegRows * config.pegSpacingV) - config.binHeight / 2; // Position below last row
    const numBins = config.pegRows + 1;
    const totalBinsWidth = numBins * config.binWidth;
    const startBinX = -(totalBinsWidth / 2) + config.binWidth / 2;

    const binWallGeometry = new THREE.BoxGeometry(config.binWallThickness, config.binHeight, config.pegHeight); // Make walls thick enough
    const binWallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const binWallShape = new CANNON.Box(new CANNON.Vec3(config.binWallThickness / 2, config.binHeight / 2, config.pegHeight / 2));
    const wallPhysicsMaterial = world.materials.find(m => m.name === 'wallMaterial');

    config.ballSettleYThreshold = binYPos - config.binHeight / 2 + config.ballRadius * 2; // Adjust settle threshold

    for (let i = 0; i <= numBins; i++) { // Need numBins + 1 walls
        const xPos = startBinX - config.binWidth / 2 + i * config.binWidth;

        // Visual Wall
        const wallMesh = new THREE.Mesh(binWallGeometry, binWallMaterial);
        wallMesh.position.set(xPos, binYPos, 0);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        scene.add(wallMesh);
        staticMeshes.push(wallMesh);

        // Physics Wall
        const wallBody = new CANNON.Body({
            mass: 0, // Static
            shape: binWallShape,
            position: new CANNON.Vec3(xPos, binYPos, 0),
            material: wallPhysicsMaterial
        });
        world.addBody(wallBody);
        boardElements.push(wallBody);
    }

     // Add side walls (optional but recommended)
     const boardHeight = (config.pegRows * config.pegSpacingV) + config.binHeight;
     const sideWallHeight = boardHeight + config.dropHeightOffset * 2; // Make tall enough
     const sideWallPosX = (totalBinsWidth / 2) + config.binWidth / 2 + config.boardWidthMargin;
     const sideWallGeometry = new THREE.BoxGeometry(config.binWallThickness, sideWallHeight, config.pegHeight);
     const sideWallShape = new CANNON.Box(new CANNON.Vec3(config.binWallThickness / 2, sideWallHeight / 2, config.pegHeight / 2));

     // Left Wall
     const leftWallMesh = new THREE.Mesh(sideWallGeometry, binWallMaterial);
     leftWallMesh.position.set(-sideWallPosX, binYPos + config.binHeight/2 - boardHeight/2 + config.dropHeightOffset, 0);
     scene.add(leftWallMesh);
     staticMeshes.push(leftWallMesh);
     const leftWallBody = new CANNON.Body({ mass: 0, shape: sideWallShape, position: new CANNON.Vec3(leftWallMesh.position.x, leftWallMesh.position.y, 0), material: wallPhysicsMaterial });
     world.addBody(leftWallBody);
     boardElements.push(leftWallBody);

     // Right Wall
     const rightWallMesh = new THREE.Mesh(sideWallGeometry, binWallMaterial);
     rightWallMesh.position.set(sideWallPosX, binYPos + config.binHeight/2 - boardHeight/2 + config.dropHeightOffset, 0);
     scene.add(rightWallMesh);
     staticMeshes.push(rightWallMesh);
     const rightWallBody = new CANNON.Body({ mass: 0, shape: sideWallShape, position: new CANNON.Vec3(rightWallMesh.position.x, rightWallMesh.position.y, 0), material: wallPhysicsMaterial });
     world.addBody(rightWallBody);
     boardElements.push(rightWallBody);
}

// --- Create a Single Ball ---
function createBall() {
    // Visual Ball
    const ballGeometry = new THREE.SphereGeometry(config.ballRadius, 16, 16);
    // Random color for visual interest
    const ballMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random() * 0xffffff),
        metalness: 0.3,
        roughness: 0.4
     });
    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.castShadow = true; // Ball casts shadow
    ballMesh.receiveShadow = true; // Ball receives shadow (less important)

    // Physics Ball
    const ballShape = new CANNON.Sphere(config.ballRadius);
    const ballPhysicsMaterial = world.materials.find(m => m.name === 'ballMaterial');
    const ballBody = new CANNON.Body({
        mass: config.ballMass,
        shape: ballShape,
        material: ballPhysicsMaterial,
        linearDamping: 0.1, // Slight damping to help settling
        angularDamping: 0.1,
    });

    // Start position: above the center top peg with slight random offset
    const startY = config.dropHeightOffset;
    const startX = (Math.random() - 0.5) * 0.1; // Tiny horizontal randomness
    ballBody.position.set(startX, startY, 0);
    ballMesh.position.copy(ballBody.position); // Sync initial position

    scene.add(ballMesh);
    world.addBody(ballBody);
    balls.push({ mesh: ballMesh, body: ballBody, settled: false });
}

// --- Bin Counting Logic ---
function checkAndBinBalls() {
    const numBins = config.pegRows + 1;
    const totalBinsWidth = numBins * config.binWidth;
    const firstBinCenterX = -(totalBinsWidth / 2) + config.binWidth / 2;

    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        if (ball.settled) continue; // Already binned

        const body = ball.body;
        const pos = body.position;
        const vel = body.velocity;

        // Check if ball is near the bottom and has low velocity
        if (pos.y < config.ballSettleYThreshold && vel.lengthSquared() < config.ballSettleVelocityThreshold * config.ballSettleVelocityThreshold) {
            // Determine which bin it's in based on X position
            let binIndex = Math.floor((pos.x - (firstBinCenterX - config.binWidth / 2)) / config.binWidth);

            // Clamp index to valid range [0, numBins - 1]
            binIndex = Math.max(0, Math.min(binIndex, numBins - 1));

            binCounts[binIndex]++;
            totalBallsDropped++;
            updateChartAndInfo();

            // Mark as settled and make static to improve performance
            ball.settled = true;
            body.type = CANNON.Body.STATIC; // Make it immovable
             body.velocity.set(0, 0, 0); // Stop any residual velocity
             body.angularVelocity.set(0, 0, 0);

            // Optional: Change color or remove from active simulation array if needed later
            // For now, just making it static is usually enough
        }
    }
}


// --- Chart Update ---
function updateChartAndInfo() {
    chart.data.datasets[0].data = binCounts; // Update actual counts
    chart.data.datasets[1].data = calculateTheoreticalDistribution(totalBallsDropped); // Update theoretical curve
    chart.update();
    totalBallsDisplay.textContent = totalBallsDropped;
}

// --- Theoretical Distribution Calculation ---
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combinations(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k; // Optimization
    // Using formula: n! / (k! * (n-k)!)
    // Be careful with large numbers, might need logarithms for larger N
     if (n > 30) { // Use approximation or log gamma for large N
         console.warn("Factorial calculation might overflow for N > 30. Using potentially less accurate direct calculation.");
     }
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function binomialProbability(n, k, p = 0.5) {
    // Probability of k successes in n trials with probability p
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function calculateTheoreticalDistribution(totalBalls) {
    const n = config.pegRows; // Number of trials (rows of pegs)
    const numBins = n + 1;
    const theoreticalCounts = new Array(numBins).fill(0);

    if (totalBalls === 0) return theoreticalCounts; // Avoid division by zero / NaN

    for (let binIndex = 0; binIndex < numBins; binIndex++) {
        // Map binIndex (0 to n) to 'k' successes (number of right turns)
        // If bin 0 is far left, it means 0 right turns. If bin n is far right, it means n right turns.
        const k = binIndex;
        const probability = binomialProbability(n, k);
        theoreticalCounts[binIndex] = probability * totalBalls;
    }
    return theoreticalCounts;
}


// --- Event Listeners ---
function setupEventListeners() {
    addBallsButton.addEventListener('click', () => {
        const numToAdd = parseInt(numBallsToAddInput.value, 10);
        if (isNaN(numToAdd) || numToAdd <= 0) return;

        let count = 0;
        function addOneBall() {
            if (count < numToAdd) {
                createBall();
                count++;
                setTimeout(addOneBall, config.addBallInterval); // Add balls gradually
            }
        }
        addOneBall(); // Start the process
    });

    resetButton.addEventListener('click', () => {
        // Remove existing balls
        balls.forEach(ball => {
            scene.remove(ball.mesh);
            world.removeBody(ball.body);
        });
        balls = []; // Clear the array

        // Reset counts and display
        binCounts.fill(0);
        totalBallsDropped = 0;
        updateChartAndInfo();
        console.log("Simulation Reset");
    });
}

// --- Window Resize Handler ---
function onWindowResize() {
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;

    if (width > 0 && height > 0) { // Ensure dimensions are valid
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
}

// --- Animation Loop ---
function animate(time) {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Step the physics world
    world.step(config.physicsTimeStep);

    // Update ball positions and check for binning
    balls.forEach(ball => {
        if (ball.body.type !== CANNON.Body.STATIC) { // Only update dynamic balls
            ball.mesh.position.copy(ball.body.position);
            ball.mesh.quaternion.copy(ball.body.quaternion);
        }
    });

    checkAndBinBalls(); // Check if any balls have settled

    // Update physics debugger if enabled
    if (config.debugPhysics && physicsDebugger) {
       // physicsDebugger.update(); // Call debugger update
    }

    // Render the scene
    renderer.render(scene, camera);
}

// --- Start ---
init();