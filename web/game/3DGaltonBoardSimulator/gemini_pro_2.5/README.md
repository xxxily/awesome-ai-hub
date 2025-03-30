请使用3dweb技术，帮我创建制作一个高尔顿板模拟器，更直观地理解概率、统计、正态分布、大数法则、二项分布等抽象数学概念

好的，使用 3D Web 技术创建一个高尔顿板（Galton Board）模拟器是一个非常棒的主意！这确实能将抽象的数学概念具象化，变得直观易懂。

下面是创建这样一个模拟器的技术选型、实现步骤和关键点的概述：

**核心目标：**

1.  **可视化：** 在 3D 空间中展示小球穿过钉板并落入底部槽中的过程。
2.  **交互性：** 用户可以控制小球的数量、下落速度、甚至可能调整钉板的层数。
3.  **数据呈现：** 实时显示底部各槽中小球的数量分布（柱状图），并与理论上的二项分布/正态分布曲线进行对比。
4.  **概念解释：** 通过模拟过程和结果，帮助理解相关数学概念。

**技术选型 (Tech Stack):**

1.  **3D 渲染引擎 (必需):**
    *   **Three.js:** 最流行、社区庞大、文档丰富、易于上手。非常适合这个项目。
    *   **Babylon.js:** 另一个强大的选择，由微软支持，功能全面，对 PBR（物理 기반 渲染）支持良好。
    *   *推荐：* **Three.js** 因其广泛的应用和丰富的学习资源，可能是更便捷的选择。

2.  **物理引擎 (必需):**
    *   **Cannon-es:** Three.js 的一个流行物理引擎搭档，纯 JavaScript 实现，相对容易集成。 (Cannon.js 的现代维护分支)
    *   **Rapier:** 基于 Rust 编译到 WebAssembly，性能非常高，功能强大。
    *   **Ammo.js:** Bullet 物理引擎的 WebAssembly 移植版，功能强大但集成可能稍复杂。
    *   *推荐：* **Cannon-es** 或 **Rapier**。Cannon-es 更易上手，Rapier 性能更好，尤其是在小球数量很多时。

3.  **用户界面 (UI) & 控制 (可选但推荐):**
    *   **HTML/CSS/JavaScript:** 用于创建按钮（开始、重置）、滑块（控制小球数量、速度）、信息显示区域。
    *   **UI 框架 (可选):** 如 Vue.js, React, Svelte 或简单的库如 dat.GUI 可以简化 UI 开发。

4.  **图表库 (用于显示分布):**
    *   **Chart.js:** 简单易用，适合绘制柱状图和曲线图。
    *   **D3.js:** 功能极其强大，但学习曲线较陡峭。
    *   **Plotly.js:** 科学绘图功能强大。
    *   *推荐：* **Chart.js** 对于这个需求来说足够且易于集成。

**实现步骤:**

1.  **环境搭建:**
    *   创建项目文件夹，设置 HTML 文件 (`index.html`)、CSS 文件 (`style.css`) 和 JavaScript 主文件 (`main.js`)。
    *   引入选择的 3D 引擎 (Three.js) 和物理引擎 (Cannon-es/Rapier) 库。可以通过 CDN 或 npm/yarn 安装。
    *   引入图表库 (Chart.js)。

2.  **创建 3D 场景:**
    *   使用 Three.js 初始化场景 (`Scene`)、相机 (`PerspectiveCamera`)、渲染器 (`WebGLRenderer`)。
    *   添加光源 (`AmbientLight`, `DirectionalLight`)。
    *   添加相机控制器 (`OrbitControls`) 以便用户可以旋转和缩放观察视角。

3.  **构建高尔顿板模型 (视觉与物理):**
    *   **视觉模型 (Three.js):**
        *   创建背景板 (`PlaneGeometry`)。
        *   创建钉子 (`CylinderGeometry` 或 `SphereGeometry`)，并按照等腰三角形排列。
        *   创建底部的分隔板和收集槽 (`BoxGeometry`)。
        *   为这些物体添加材质 (`MeshStandardMaterial` 或 `MeshBasicMaterial`)。
    *   **物理模型 (Cannon-es/Rapier):**
        *   初始化物理世界 (`CANNON.World` 或 `RAPIER.World`)，设置重力。
        *   为钉子、背景板、分隔板创建**静态**物理体 (`CANNON.Body` / `RAPIER.RigidBodyDesc.newStatic()`)，形状要与视觉模型大致对应 (e.g., `CANNON.Cylinder`, `CANNON.Plane`, `CANNON.Box` / `RAPIER.ColliderDesc.cylinder()`, `RAPIER.ColliderDesc.cuboid()`)。确保物理体的位置与视觉模型匹配。

4.  **创建小球 (视觉与物理):**
    *   **视觉模型 (Three.js):** 创建小球的几何体 (`SphereGeometry`) 和材质。
    *   **物理模型 (Cannon-es/Rapier):**
        *   为小球创建**动态**物理体 (`CANNON.Body` / `RAPIER.RigidBodyDesc.newDynamic()`)，赋予质量 (`mass`) 和球形碰撞体 (`CANNON.Sphere` / `RAPIER.ColliderDesc.ball()`)。
        *   设置物理材质 (`CANNON.Material`) 并定义小球与钉子、板之间的**碰撞属性**（摩擦力 `friction`、弹性 `restitution` - 这个很重要，影响小球弹跳行为）。

5.  **模拟循环 (Animation Loop):**
    *   使用 `requestAnimationFrame` 创建主循环。
    *   在每一帧：
        *   更新物理世界 (`world.step()`)。
        *   遍历所有**活动**的小球（视觉对象）。
        *   将其位置 (`position`) 和旋转 (`quaternion`) 更新为对应物理体的位置和旋转。
        *   渲染 Three.js 场景 (`renderer.render(scene, camera)`)。

6.  **小球下落逻辑:**
    *   创建一个函数 `dropBall()`，用于在顶部的特定位置（或略带随机偏移）创建新的小球（视觉+物理对象）并添加到场景和物理世界中。
    *   通过 UI 控制（如按钮点击或定时器）调用 `dropBall()`。

7.  **底部槽计数:**
    *   **方法一 (碰撞检测):** 在每个槽底部设置触发器区域（特殊的静态物理体，设置为 `isTrigger=true` 或类似属性）。监听碰撞事件，当小球进入某个槽的触发区域时，增加该槽的计数，并将该小球从模拟中移除（或设为静态）以提高性能。
    *   **方法二 (位置检测):** 当小球落到底部区域（Y 坐标低于某个阈值）且速度很慢时，判断其 X 坐标属于哪个槽的范围，然后增加计数并移除/冻结小球。
    *   维护一个数组 `binCounts` 来存储每个槽的小球数量。

8.  **数据可视化 (Chart.js):**
    *   在 HTML 中创建一个 `<canvas>` 元素用于绘制图表。
    *   使用 Chart.js 初始化一个柱状图 (`type: 'bar'`)。
    *   图表的 `data.labels` 设置为槽的编号 (e.g., "-3", "-2", "-1", "0", "1", "2", "3")。
    *   图表的 `data.datasets[0].data` 绑定到 `binCounts` 数组。
    *   在模拟过程中（例如每隔一段时间或每次有小球落入槽中），调用 `chart.update()` 来更新图表显示。

9.  **绘制理论分布曲线:**
    *   **二项分布:** 对于有 `n` 层钉板的高尔顿板，小球最终落入第 `k` 个槽（假设中间为 0，向左为负，向右为正）的概率遵循二项分布 B(n, 0.5) 中成功 `n/2 + k` 次（或类似计算，取决于槽的编号方式）的概率。计算出每个槽的理论概率 `P(k)`。
    *   **正态分布:** 当 `n` 很大时，二项分布可以用正态分布 N(μ, σ²) 来近似。其中均值 μ = n * p = n * 0.5，方差 σ² = n * p * (1-p) = n * 0.25。计算正态分布概率密度函数 (PDF) 在每个槽中心点的值。
    *   **绘制:** 将计算出的理论概率（或 PDF 值）乘以总小球数，得到理论上的期望小球数。使用 Chart.js 在同一个图表上添加一个 `type: 'line'` 的数据集来绘制这条理论曲线，与实际的柱状图进行对比。

10. **添加 UI 控件和说明:**
    *   添加按钮（开始/暂停、重置模拟、单步下落）。
    *   添加滑块或输入框（控制总小球数、下落速率、钉板层数 - 如果做成可变的）。
    *   在页面上添加文字说明，解释高尔顿板是什么，以及它如何演示以下概念：
        *   **概率:** 每个钉子处小球向左或向右是随机事件（理想情况下各 50%）。
        *   **二项分布:** 小球最终落入哪个槽取决于它在一系列二选一（左/右）决策中的总结果，这正是二项分布描述的场景。
        *   **正态分布:** 当钉板层数（试验次数）足够多时，底部小球形成的分布形状（柱状图）会趋近于钟形的**正态分布曲线**。这是中心极限定理的一个直观展示。
        *   **大数法则:** 随着下落的小球数量**越来越多**，实际观察到的分布（柱状图）会越来越接近理论上的二项/正态分布曲线。单次或少量试验结果随机性很大，大量重复试验则会显现出规律性。
        *   **统计:** 收集每个槽的小球数量就是在进行数据收集，绘制柱状图就是在进行数据可视化和频数分布统计。

**关键点和挑战:**

*   **物理参数调整:** 小球的弹性 (`restitution`)、摩擦力 (`friction`) 以及物理引擎的时间步长 (`timeStep`) 对模拟结果的真实性和稳定性至关重要，需要反复调试。目标是让小球在每个钉子处有接近 50/50 的左右分流概率。
*   **性能优化:** 当小球数量非常多时，物理计算和渲染会成为瓶颈。需要：
    *   及时移除或冻结（设为静态/睡眠状态）落入底部槽中不再运动的小球。
    *   使用性能更高的物理引擎（如 Rapier）。
    *   考虑 Instanced Mesh (Three.js) 来高效渲染大量相同的小球。
*   **准确性 vs. 视觉效果:** 完美的 50/50 分流在物理模拟中很难精确实现，但可以通过调整钉子形状、碰撞参数等来尽量接近。重点在于展示分布趋势而非精确的概率计算。
*   **用户体验:** 清晰的界面、流畅的动画、直观的控制和明确的解释是提升学习效果的关键。

**总结:**

创建一个 3D Web 高尔顿板模拟器是一个涉及 3D 图形、物理模拟、数据可视化和 UI 交互的综合性项目。虽然有一定技术挑战，但完成后将是一个非常有价值的教育工具，能够生动地展示概率统计中的核心概念。从基础版本开始，逐步添加功能和优化，你会得到一个很棒的成果！祝你开发顺利！


请给出具体的实现代码


Okay, creating a full-fledged 3D Galton Board simulator with physics, charting, and UI involves quite a bit of code. Below is a comprehensive example using **Three.js** for the 3D rendering, **Cannon-es** for the physics simulation, and **Chart.js** for visualizing the distribution.

**This example provides:**

1.  A basic 3D scene setup.
2.  A procedurally generated Galton Board (pegs, walls, bins).
3.  Physics simulation for falling balls.
4.  Bin counting when balls settle.
5.  A bar chart (using Chart.js) showing the distribution in real-time.
6.  Basic UI controls (Add Balls, Reset).
7.  Calculation and overlay of the theoretical Binomial distribution curve.

**Prerequisites:**

*   A modern web browser supporting WebGL and ES6 Modules.
*   You can run this by saving the HTML, CSS, and JS files and opening the HTML file in your browser (you might need a simple local server due to ES6 module imports).

---

**1. `index.html` (The Main Page)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Galton Board Simulator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="info">
        <h2>3D Galton Board Simulator</h2>
        <p>观察小球下落如何形成近似正态分布。</p>
        <div id="controls">
            <label for="numBallsToAdd">添加小球数量:</label>
            <input type="number" id="numBallsToAdd" value="100" min="1" max="500">
            <button id="addBallsButton">添加小球</button>
            <button id="resetButton">重置</button>
        </div>
        <p>已落下小球总数: <span id="totalBallsDisplay">0</span></p>
        <p>钉子层数: <span id="pegRowsDisplay">10</span></p> <!-- Example: Display peg rows -->
    </div>

    <div id="simulationContainer">
        <div id="sceneContainer"></div>
        <div id="chartContainer">
            <canvas id="distributionChart"></canvas>
        </div>
    </div>

    <!-- Libraries (using CDNs for simplicity) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/cannon-es@0.19.0/dist/cannon-es.js"></script>
    <!-- OrbitControls is often separate -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js"></script>

    <!-- Your simulation code -->
    <script type="module" src="main.js"></script>
</body>
</html>
```

---

**2. `style.css` (Basic Styling)**

```css
body {
    margin: 0;
    font-family: sans-serif;
    background-color: #f0f0f0;
    color: #333;
    display: flex;
    flex-direction: column; /* Stack info and simulation vertically */
    height: 100vh;
    overflow: hidden; /* Prevent body scrollbars */
}

#info {
    padding: 15px;
    background-color: #ddd;
    border-bottom: 1px solid #ccc;
    text-align: center; /* Center info text */
}

#controls {
    margin-top: 10px;
    margin-bottom: 10px;
}

#controls label {
    margin-right: 5px;
}

#controls input[type="number"] {
    width: 60px;
    margin-right: 10px;
}

#controls button {
    padding: 5px 10px;
    margin-left: 5px;
    cursor: pointer;
}

#simulationContainer {
    display: flex; /* Arrange scene and chart side-by-side */
    flex-grow: 1; /* Allow this container to fill remaining space */
    overflow: hidden; /* Prevent internal scrollbars if content overflows */
}

#sceneContainer {
    flex: 3; /* Give scene more space */
    position: relative; /* Needed for potential overlays */
    min-width: 0; /* Prevent flex item from overflowing */
     border-right: 1px solid #ccc; /* Separator */
}

#chartContainer {
    flex: 2; /* Give chart less space */
    padding: 15px;
    background-color: #fff;
    display: flex; /* Center canvas */
    align-items: center;
    justify-content: center;
    min-width: 0; /* Prevent flex item from overflowing */
    overflow: hidden; /* Hide overflow */
}

canvas#distributionChart {
    max-width: 100%;
    max-height: 100%;
}

/* Style the Three.js canvas if needed (usually fills container) */
#sceneContainer canvas {
    display: block;
    width: 100%;
    height: 100%;
}
```

---

**3. `main.js` (The Core Logic)**

```javascript
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
```

---

**How to Run:**

1.  **Save:** Save the three code blocks above as `index.html`, `style.css`, and `main.js` in the same folder.
2.  **Local Server:** Because `main.js` uses ES6 module imports (`import * as THREE...`), you cannot simply open `index.html` directly from your file system in most browsers due to security restrictions (CORS). You need a simple local web server.
    *   If you have Node.js installed, open a terminal in the folder containing the files and run: `npx http-server`
    *   If you have Python 3 installed, run: `python -m http.server`
    *   If you use VS Code, you can install the "Live Server" extension.
3.  **Open:** Open your web browser and navigate to the address provided by the local server (e.g., `http://localhost:8080` or `http://127.0.0.1:8000`).

**Explanation & Key Concepts Demonstrated:**

1.  **3D Visualization (Three.js):** Creates the visual representation of the board and balls. Uses lighting and shadows for better depth. `OrbitControls` allows interaction.
2.  **Physics Simulation (Cannon-es):**
    *   `CANNON.World`: Manages the physics simulation.
    *   `CANNON.Body`: Represents physical objects (static for pegs/walls, dynamic for balls).
    *   `CANNON.Material` & `CANNON.ContactMaterial`: Define how objects interact upon collision (bounciness `restitution`, `friction`). Tuning these is crucial for realistic behavior.
    *   `world.step()`: Advances the physics simulation by a small time step in the `animate` loop.
3.  **Connecting Physics and Visuals:** In the `animate` loop, the position and rotation of each visual ball mesh (`ball.mesh`) are updated to match its corresponding physics body (`ball.body`) on every frame.
4.  **Randomness & Probability:** Each time a ball hits a peg, the physics engine determines its bounce direction based on collision angles and material properties. Ideally, this leads to roughly a 50/50 chance of going left or right at each peg.
5.  **Binomial Distribution:** The final horizontal position of a ball depends on the *sum* of many (approximately) independent left/right choices (one for each row of pegs it encounters). This naturally leads to a binomial distribution for the probability of landing in a specific bin. The `calculateTheoreticalDistribution` function computes this.
6.  **Normal Distribution Approximation:** As the number of peg rows (`config.pegRows`) increases, the binomial distribution visually approximates the bell shape of the normal (Gaussian) distribution. This is a demonstration of the **Central Limit Theorem**.
7.  **Law of Large Numbers:** When you drop only a few balls (`totalBallsDropped` is small), the observed distribution (blue bars) might look quite random and uneven. As you add *more and more* balls, the shape of the blue bars will increasingly resemble the theoretical red curve. This demonstrates that with more trials, the experimental average converges towards the theoretical expectation.
8.  **Statistics:** The process of counting balls in each bin (`binCounts`) and visualizing it with the chart is a basic form of data collection and frequency distribution analysis.
9.  **Performance:** Making balls `STATIC` once they settle in the bins (`checkAndBinBalls` function) significantly improves performance, as the physics engine no longer needs to calculate their movements.

Feel free to tweak the `config` values (especially `pegRows`, physics properties, and thresholds) to see how they affect the simulation!