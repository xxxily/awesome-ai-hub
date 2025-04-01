请使用前端技术，帮我创建制作一个高尔顿板模拟器，以便可以更直观地理解概率、统计、正态分布、大数法则、二项分布等抽象数学概念

注意：

1、所有代码都在index.html上

2、通过图表自动统计和显示模拟结果

3、页面需要进行移动端适配

4、确保移动端下控制面板和图表统计结果面板不会挡住模拟器的显示和相关操作

5、考虑美观和实用


好的，这是一个使用 HTML、CSS 和 JavaScript (包括 Chart.js 库) 创建的高尔顿板模拟器。所有代码都在一个 `index.html` 文件中，并且考虑了美观、实用性和移动端适配。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>高尔顿板模拟器</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2ecc71;
            --background-color: #f4f4f4;
            --peg-color: #34495e;
            --ball-color: #e74c3c;
            --bin-color: #7f8c8d;
            --text-color: #333;
            --border-radius: 5px;
            --panel-bg: #ffffff;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--background-color);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 10px;
            box-sizing: border-box;
        }

        .simulator-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 800px; /* Limit max width for larger screens */
            background-color: var(--panel-bg);
            border-radius: var(--border-radius);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden; /* Important for rounded corners */
            margin-bottom: 20px;
        }

        .canvas-wrapper {
            position: relative;
            width: 100%;
            /* Maintain aspect ratio, adjust as needed */
            aspect-ratio: 1 / 0.8;
            background-color: #e0e0e0;
            overflow: hidden; /* Keep balls inside */
        }

        #galtonCanvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        .controls-panel, .results-panel {
            padding: 15px;
            background-color: var(--panel-bg);
            border-top: 1px solid #ddd;
        }

        .controls-panel h2, .results-panel h2 {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
            color: var(--primary-color);
            font-size: 1.2em;
        }

        .control-group {
            margin-bottom: 15px;
            display: flex;
            flex-direction: column; /* Stack label and input */
            align-items: flex-start; /* Align items to the start */
        }

        .control-group label {
            margin-bottom: 5px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .control-group input[type="range"] {
            width: 100%; /* Full width within its group */
            cursor: pointer;
        }
         .control-group span {
            font-size: 0.9em;
            margin-left: 5px; /* Space between slider and value */
            color: var(--secondary-color);
            font-weight: bold;
         }


        .button-group {
            display: flex;
            justify-content: space-around; /* Space out buttons */
            gap: 10px; /* Add gap between buttons */
            margin-top: 15px;
        }

        button {
            padding: 10px 15px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s ease;
            flex-grow: 1; /* Allow buttons to grow */
        }

        button:hover:not(:disabled) {
            background-color: #2980b9;
        }

        button:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
        }

        .chart-container {
            position: relative;
            width: 100%;
            min-height: 250px; /* Ensure chart has some height */
            margin-top: 10px;
        }

        #resultsChart {
            display: block;
            width: 100%;
            height: 100%;
        }

        .info-text {
            text-align: center;
            margin-top: 5px;
            font-size: 0.9em;
            color: #555;
        }

        /* --- Mobile Responsiveness --- */
        /* Styles are generally mobile-first friendly */

        /* Media query for larger screens (e.g., tablets and desktops) */
        @media (min-width: 768px) {
            .simulator-container {
               /* Optionally allow side-by-side layout on wider screens */
               /* display: flex; flex-direction: row; */
               /* Keeping vertical stack often works well even on desktop */
            }

            .controls-panel, .results-panel {
                /* Adjust padding or layout if needed */
            }

             .control-group {
                flex-direction: row; /* Label and input side-by-side */
                align-items: center; /* Vertically align label and input */
             }
             .control-group label {
                 margin-bottom: 0;
                 margin-right: 10px; /* Space between label and slider */
                 min-width: 80px; /* Ensure labels align somewhat */
                 text-align: right;
             }
             .control-group input[type="range"] {
                 flex-grow: 1; /* Allow slider to take remaining space */
             }
        }
    </style>
</head>
<body>

    <h1>高尔顿板模拟器 (Galton Board)</h1>

    <div class="simulator-container">
        <div class="canvas-wrapper">
            <canvas id="galtonCanvas"></canvas>
        </div>

        <div class="controls-panel">
            <h2>控制面板</h2>
            <div class="control-group">
                <label for="levelsSlider">板层数:</label>
                <input type="range" id="levelsSlider" min="3" max="16" value="8">
                <span id="levelsValue">8</span>
            </div>
            <div class="control-group">
                <label for="ballsSlider">小球数量:</label>
                <input type="range" id="ballsSlider" min="10" max="2000" value="500" step="10">
                <span id="ballsValue">500</span>
            </div>
            <div class="control-group">
                <label for="speedSlider">模拟速度:</label>
                <input type="range" id="speedSlider" min="1" max="100" value="80">
                 <span id="speedValue">80</span>
            </div>
            <div class="button-group">
                <button id="startButton">开始模拟</button>
                <button id="resetButton">重置</button>
            </div>
        </div>

        <div class="results-panel">
            <h2>统计结果 (正态分布)</h2>
            <div class="chart-container">
                <canvas id="resultsChart"></canvas>
            </div>
             <p class="info-text" id="simulationInfo">等待开始...</p>
        </div>
    </div>

    <script>
        // --- DOM Elements ---
        const canvas = document.getElementById('galtonCanvas');
        const ctx = canvas.getContext('2d');
        const levelsSlider = document.getElementById('levelsSlider');
        const levelsValue = document.getElementById('levelsValue');
        const ballsSlider = document.getElementById('ballsSlider');
        const ballsValue = document.getElementById('ballsValue');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        const simulationInfo = document.getElementById('simulationInfo');
        const resultsChartCanvas = document.getElementById('resultsChart');

        // --- Simulation Parameters ---
        let levels = parseInt(levelsSlider.value);
        let numBalls = parseInt(ballsSlider.value);
        let simulationSpeed = parseInt(speedSlider.value); // Higher value = faster simulation (less delay)

        // --- Simulation State ---
        let pegs = [];
        let bins = [];
        let balls = [];
        let binCounts = [];
        let animationFrameId = null;
        let simulationRunning = false;
        let ballsDropped = 0;
        let ballsToDrop = 0;
        let dropInterval = 5; // Milliseconds between ball drops calculation base

        // --- Chart ---
        let resultsChart = null;

        // --- Constants ---
        const PEG_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--peg-color').trim();
        const BALL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--ball-color').trim();
        const BIN_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--bin-color').trim();
        const BALL_RADIUS = 4;
        const PEG_RADIUS = 3;

        // --- Utility Functions ---
        function getRandomBinary() {
            return Math.random() < 0.5 ? -1 : 1; // -1 for left, 1 for right
        }

        function calculateDropInterval() {
             // Inverse relationship: higher speed value means lower interval
             // Adjust the formula for desired speed range
             const maxInterval = 100; // Slowest interval
             const minInterval = 1;   // Fastest interval
             dropInterval = maxInterval - (simulationSpeed / 100) * (maxInterval - minInterval) + minInterval;
        }


        // --- Drawing Functions ---
        function resizeCanvas() {
            const wrapper = canvas.parentElement;
            canvas.width = wrapper.clientWidth;
            canvas.height = wrapper.clientHeight;
            // Also resize chart canvas if needed (Chart.js usually handles responsiveness well)
             if (resultsChart) {
                 resultsChart.resize();
             }
            drawBoard(); // Redraw board after resize
            drawBalls(); // Redraw existing balls
        }

        function drawBoard() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pegs = [];
            bins = [];
            const topMargin = canvas.height * 0.15; // Space at the top
            const bottomMargin = canvas.height * 0.15; // Space for bins
            const pegAreaHeight = canvas.height - topMargin - bottomMargin;
            const horizontalPadding = canvas.width * 0.1; // Padding on the sides

            const availableWidth = canvas.width - 2 * horizontalPadding;
            const horizontalSpacing = availableWidth / (levels); // Space between pegs horizontally
            const verticalSpacing = pegAreaHeight / (levels > 1 ? levels -1 : 1); // Space between levels vertically

            // Draw Pegs
            ctx.fillStyle = PEG_COLOR;
            for (let i = 0; i < levels; i++) {
                const numPegsInLevel = i + 1;
                const levelY = topMargin + i * verticalSpacing;
                const levelWidth = i * horizontalSpacing;
                const startX = (canvas.width - levelWidth) / 2;

                pegs[i] = [];
                for (let j = 0; j < numPegsInLevel; j++) {
                    const pegX = startX + j * horizontalSpacing;
                    const pegY = levelY;
                    pegs[i].push({ x: pegX, y: pegY });
                    ctx.beginPath();
                    ctx.arc(pegX, pegY, PEG_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

             // Draw Bins (Collectors)
             const numBins = levels + 1;
             const binWidth = availableWidth / numBins;
             const binHeight = bottomMargin * 0.8; // Height of the bin walls
             const binStartY = canvas.height - binHeight;

            ctx.fillStyle = BIN_COLOR;
            ctx.strokeStyle = BIN_COLOR; // Use same color for stroke initially
            ctx.lineWidth = 2;

            bins = new Array(numBins);
            const firstBinStartX = horizontalPadding; // Start bins aligned with outer peg potential paths

            for (let i = 0; i < numBins; i++) {
                 const binX = firstBinStartX + i * binWidth;
                 bins[i] = { x: binX, y: binStartY, width: binWidth, height: binHeight };

                 // Draw bin dividers
                 if (i > 0) {
                      ctx.beginPath();
                      ctx.moveTo(binX, binStartY);
                      ctx.lineTo(binX, canvas.height);
                      ctx.stroke();
                 }
             }
             // Draw bottom line
             ctx.beginPath();
             ctx.moveTo(firstBinStartX, canvas.height);
             ctx.lineTo(firstBinStartX + numBins * binWidth, canvas.height);
             ctx.stroke();
        }

        function createBall() {
             // Start slightly offset horizontally for visual variety if desired
            const startX = canvas.width / 2 + (Math.random() - 0.5) * 5;
            return {
                x: startX,
                y: BALL_RADIUS * 2,
                vx: 0, // Horizontal velocity (simplified)
                vy: 2 + Math.random() * 1, // Vertical velocity
                level: 0, // Current peg level it's approaching
                targetPegIndex: 0, // Index of the peg it's aiming for in the next level
                pathChoices: [], // Stores -1 (left) or 1 (right) for each level
                finalBin: -1, // Calculated final bin index (-1 until calculated)
                active: true // Still moving?
            };
        }

         function drawBalls() {
            ctx.fillStyle = BALL_COLOR;
            balls.forEach(ball => {
                if (ball.active) {
                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // --- Simulation Logic ---
        function updateSimulation() {
             if (!simulationRunning) return;

             ctx.clearRect(0, 0, canvas.width, canvas.height);
             drawBoard(); // Redraw board elements

             let activeBalls = 0;

             // Drop new balls based on speed
             let ballsToAddThisFrame = 0;
             if (ballsDropped < ballsToDrop) {
                  // Calculate how many balls should have been dropped by now
                  const elapsed = performance.now() - startTime;
                  const expectedDropped = Math.floor(elapsed / dropInterval);
                  ballsToAddThisFrame = Math.min(expectedDropped - ballsDropped, ballsToDrop - ballsDropped, 5); // Add up to 5 balls per frame to prevent stutter

                  for (let i = 0; i < ballsToAddThisFrame; i++) {
                      balls.push(createBall());
                  }
                  ballsDropped += ballsToAddThisFrame;
             }


             // Update existing balls
             balls.forEach((ball, index) => {
                 if (!ball.active) return;

                 activeBalls++;

                 // Simplified Movement & Collision Logic
                 if (ball.level < levels) {
                    const targetPegY = pegs[ball.level][ball.targetPegIndex].y;

                    // Move towards the target peg level
                    ball.y += ball.vy;

                    // Check if reached or passed the peg level
                    if (ball.y >= targetPegY) {
                        ball.y = targetPegY; // Snap to peg level for decision

                        // Make random choice (left -1 or right 1)
                        const choice = getRandomBinary();
                        ball.pathChoices.push(choice);

                        // Calculate next target peg index
                        // If going left (-1), index stays same relative to next row start
                        // If going right (+1), index increases by 1 relative to next row start
                        // The actual horizontal movement happens next
                        ball.targetPegIndex += (choice === 1 ? 1 : 0);

                        // Add slight horizontal velocity based on choice
                        ball.vx = choice * (Math.random() * 0.5 + 0.5) * 1.5; // Small horizontal push

                        ball.level++; // Move to next level
                    }
                 } else {
                    // Ball has passed all peg levels, move towards bins
                    ball.y += ball.vy * 1.5; // Fall faster into bins
                 }

                 // Apply horizontal movement drift
                 ball.x += ball.vx;
                 // Dampen horizontal velocity slightly over time (optional)
                 // ball.vx *= 0.98;

                 // Boundary check (simple wall collision) - prevent balls escaping sides
                 if (ball.x < BALL_RADIUS) {
                     ball.x = BALL_RADIUS;
                     ball.vx *= -0.5; // Bounce slightly
                 } else if (ball.x > canvas.width - BALL_RADIUS) {
                     ball.x = canvas.width - BALL_RADIUS;
                     ball.vx *= -0.5; // Bounce slightly
                 }


                // Check if ball reached the bin area
                if (ball.y >= canvas.height - BALL_RADIUS * 2 - (bins[0]?.height || 0) ) { // Check against top of bin area or canvas bottom
                    ball.active = false;

                    // Calculate final bin based on path (sum of choices + levels / 2)
                    // Or more reliably, based on final X position
                    let landingBin = -1;
                    for(let i = 0; i < bins.length; i++) {
                        if (ball.x >= bins[i].x && ball.x < bins[i].x + bins[i].width) {
                            landingBin = i;
                            break;
                        }
                    }
                     // Fallback if slightly outside due to calculation/speed
                     if (landingBin === -1) {
                         if (ball.x < bins[0].x) landingBin = 0;
                         else landingBin = bins.length - 1;
                     }


                    if (landingBin >= 0 && landingBin < binCounts.length) {
                        binCounts[landingBin]++;
                    } else {
                        console.warn("Ball landed outside defined bins", landingBin, ball.x);
                        // Assign to nearest valid bin if out of bounds?
                        landingBin = Math.max(0, Math.min(bins.length - 1, landingBin));
                         binCounts[landingBin]++;
                    }
                    // Optional: Remove ball from array to improve performance on very large numbers
                    // Though keeping them might be useful for final display state
                    // balls.splice(index, 1); // Be careful when splicing during iteration
                 }
             });

             drawBalls(); // Draw all active balls in their new positions

             // Update Chart periodically
             if (activeBalls > 0 || ballsDropped < ballsToDrop) {
                 // Update chart more frequently when balls are actively falling
                 // Or less frequently to save performance
                 if (ballsDropped % Math.max(1, Math.floor(ballsToDrop / 20)) === 0 || activeBalls < 10) { // Update ~20 times or when near end
                     updateChart();
                 }
                 animationFrameId = requestAnimationFrame(updateSimulation);
             } else {
                 // Simulation finished
                 simulationRunning = false;
                 updateChart(); // Final chart update
                 enableControls();
                 simulationInfo.textContent = `模拟完成！共 ${ballsToDrop} 个小球落下。`;
                 // console.log("Final Bin Counts:", binCounts);
             }
             // Update info text during simulation
            if (simulationRunning) {
                simulationInfo.textContent = `模拟中... 已落下 ${ballsDropped} / ${ballsToDrop} 个小球`;
            }
        }

        // --- Chart Logic ---
        function initializeChart() {
            if (resultsChart) {
                resultsChart.destroy(); // Destroy previous chart instance
            }
            const binLabels = Array.from({ length: levels + 1 }, (_, i) => `槽 ${i}`);
            binCounts = new Array(levels + 1).fill(0);

            resultsChart = new Chart(resultsChartCanvas, {
                type: 'bar',
                data: {
                    labels: binLabels,
                    datasets: [{
                        label: '落入各槽小球数量',
                        data: binCounts,
                        backgroundColor: Array(levels + 1).fill(0).map(() => `rgba(${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 150 + 100)}, ${Math.floor(Math.random() * 150 + 150)}, 0.6)`), // Use dynamic colors or a fixed palette
                        borderColor: Array(levels + 1).fill(0).map(() => `rgba(${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 150 + 100)}, ${Math.floor(Math.random() * 150 + 150)}, 1)`),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Allow chart to fill container height
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '小球数量'
                            }
                        },
                        x: {
                             title: {
                                display: true,
                                text: '收集槽编号'
                            }
                        }
                    },
                    plugins: {
                         legend: {
                             display: false // Hide legend if only one dataset
                         },
                        title: {
                             display: true,
                             text: '高尔顿板结果分布'
                        }
                    },
                    animation: {
                        duration: 300, // Short animation for updates
                        easing: 'linear'
                    }
                }
            });
        }

        function updateChart() {
            if (!resultsChart) return;
            resultsChart.data.datasets[0].data = binCounts;
             resultsChart.update();
        }

        // --- Control Logic ---
        function disableControls() {
            startButton.disabled = true;
            resetButton.disabled = false; // Enable reset while running
            levelsSlider.disabled = true;
            ballsSlider.disabled = true;
            speedSlider.disabled = true; // Disable speed change mid-simulation for simplicity
        }

        function enableControls() {
            startButton.disabled = false;
            resetButton.disabled = false; // Keep reset enabled
            levelsSlider.disabled = false;
            ballsSlider.disabled = false;
            speedSlider.disabled = false;
        }

        function startSimulation() {
            if (simulationRunning) return;

            simulationRunning = true;
            disableControls();

            levels = parseInt(levelsSlider.value);
            ballsToDrop = parseInt(ballsSlider.value);
            simulationSpeed = parseInt(speedSlider.value);
            calculateDropInterval();

            balls = [];
            ballsDropped = 0;
            binCounts = new Array(levels + 1).fill(0);

            // Ensure canvas dimensions are set before drawing
            resizeCanvas(); // Recalculate layout based on current levels
            initializeChart(); // Reinitialize chart with new levels/bins
            drawBoard(); // Redraw board with new levels

            simulationInfo.textContent = `准备开始模拟 ${ballsToDrop} 个小球...`;
            startTime = performance.now(); // For timing ball drops

            // Start the animation loop
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(updateSimulation);
        }

        function resetSimulation() {
             simulationRunning = false;
             if (animationFrameId) {
                 cancelAnimationFrame(animationFrameId);
                 animationFrameId = null;
             }

             levels = parseInt(levelsSlider.value); // Update levels from slider
             ballsToDrop = parseInt(ballsSlider.value); // Update ball count
             simulationSpeed = parseInt(speedSlider.value); // Update speed

             balls = [];
             ballsDropped = 0;
             binCounts = new Array(levels + 1).fill(0);

             // Ensure canvas dimensions are set before drawing
             resizeCanvas(); // Recalculate layout based on current levels
             initializeChart(); // Reset chart
             drawBoard(); // Draw clean board
             updateChart(); // Show empty chart

             enableControls();
             simulationInfo.textContent = "模拟已重置。请点击“开始模拟”。";
         }

        // --- Event Listeners ---
        levelsSlider.addEventListener('input', (e) => {
            levelsValue.textContent = e.target.value;
            if (!simulationRunning) {
                 levels = parseInt(e.target.value);
                 // Need to redraw board and reinitialize chart if levels change
                 resizeCanvas(); // Recalculates positions based on new 'levels'
                 initializeChart();
            }
        });

        ballsSlider.addEventListener('input', (e) => {
            ballsValue.textContent = e.target.value;
             if (!simulationRunning) {
                ballsToDrop = parseInt(e.target.value);
             }
        });

        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value;
            simulationSpeed = parseInt(e.target.value);
            calculateDropInterval(); // Update drop interval immediately
        });

        startButton.addEventListener('click', startSimulation);
        resetButton.addEventListener('click', resetSimulation);
        window.addEventListener('resize', resizeCanvas);

        // --- Initial Setup ---
        levelsValue.textContent = levelsSlider.value;
        ballsValue.textContent = ballsSlider.value;
        speedValue.textContent = speedSlider.value;
        calculateDropInterval();
        resizeCanvas(); // Initial draw based on default values
        initializeChart(); // Initialize chart on load
        enableControls(); // Start with controls enabled
        resetButton.disabled = true; // Reset is initially disabled until started

    </script>

</body>
</html>
```

**说明:**

1.  **HTML 结构 (`index.html`)**:
    * 包含必要的 `meta` 标签（特别是 `viewport` 用于移动端）。
    * 引入 Chart.js 库的 CDN 链接。
    * 主体结构分为三个主要部分：模拟区域 (`canvas-wrapper`)、控制面板 (`controls-panel`) 和结果图表区域 (`results-panel`)，都包裹在一个 `simulator-container` 中。
    * 使用 `canvas` 元素 (`galtonCanvas` 用于模拟，`resultsChart` 用于图表)。
    * 控制面板包含滑块 (`input[type="range"]`) 用于调整层数、小球数量和速度，以及开始/重置按钮。
    * 使用 `label` 和 `span` 显示滑块的当前值。
    * 结果区域包含图表的 `canvas` 和一个信息文本 (`simulationInfo`)。

2.  **CSS 样式 (`<style>` 标签)**:
    * 使用 CSS 变量 (`:root`) 定义颜色和常用值，方便修改主题。
    * 基本的页面布局和元素样式（背景、字体、边距、内边距）。
    * `.simulator-container`: 使用 Flexbox 垂直排列三个主要部分。设置 `max-width` 以便在大屏幕上不会过宽。`overflow: hidden` 配合 `border-radius` 使用。
    * `.canvas-wrapper`: 使用 `aspect-ratio` 保持模拟区域的比例。`position: relative` 和 `overflow: hidden`。
    * `.controls-panel`, `.results-panel`: 设置内边距和背景。
    * **移动端适配**:
        * 布局默认采用垂直堆叠 (`flex-direction: column`)，天然适合移动端。控制面板和结果面板位于模拟画布下方，不会遮挡。
        * 使用 `@media (min-width: 768px)` 为平板和桌面端调整控制组 (`.control-group`) 的布局，使标签和滑块水平排列，提升空间利用率。
        * `canvas` 和图表容器的宽度设置为 `100%`，使其在父容器内自适应。
    * 按钮和滑块样式，包括禁用状态。
    * `.chart-container`: 设置 `min-height` 保证图表区域有初始高度。

3.  **JavaScript 逻辑 (`<script>` 标签)**:
    * **获取 DOM 元素**: 获取所有需要的 HTML 元素的引用。
    * **状态变量**: 定义模拟参数（层数、球数、速度）、状态（钉子位置 `pegs`、收集槽 `bins`、小球数组 `balls`、各槽计数 `binCounts`、动画 ID `animationFrameId`、运行标志 `simulationRunning` 等）。
    * **Chart.js**: 定义 `resultsChart` 变量来存储图表实例。
    * **核心函数**:
        * `resizeCanvas()`: 处理窗口大小调整，重新计算画布尺寸、元素位置并重绘。
        * `drawBoard()`: 绘制背景、钉子（小圆点）和底部的收集槽（矩形）。钉子和收集槽的位置根据当前层数和画布尺寸动态计算。
        * `createBall()`: 创建一个新的小球对象，包含初始位置、速度（简化处理）、路径选择等属性。
        * `drawBalls()`: 遍历 `balls` 数组并绘制所有活动的小球。
        * `updateSimulation()`: 这是动画循环的核心。
            * 清除画布、重绘板子。
            * 根据速度设定，在每个合适的时机添加新的小球 (`ballsDropped`, `dropInterval`)。
            * 更新每个活动小球的位置：
                * **简化物理**: 当小球到达钉子层级时，随机选择向左或向右（`getRandomBinary`），并施加一个小的水平速度分量。主要还是垂直下落。
                * 当小球越过所有钉子层，就直接落向底部。
                * 简单的边界碰撞检测，防止小球飞出画布。
            * 当小球到达底部区域时，判断它落入哪个收集槽 (`bins`)，增加对应槽的计数 (`binCounts`)，并将小球标记为非活动 (`ball.active = false`)。
            * 绘制所有活动小球。
            * 定期（不是每一帧，以提高性能）调用 `updateChart()` 更新图表。
            * 使用 `requestAnimationFrame(updateSimulation)` 实现动画循环。
            * 当所有小球落下后，停止动画，启用控件，显示最终信息。
        * `initializeChart()`: 使用 Chart.js 创建或重置条形图，根据当前的层数设置 X 轴标签（槽编号）和初始化数据。
        * `updateChart()`: 更新 Chart.js 图表的数据集并重新渲染。
        * `startSimulation()`: 处理开始按钮点击事件。设置状态、禁用控件、重置计数、初始化小球掉落逻辑、启动动画循环。
        * `resetSimulation()`: 处理重置按钮点击事件。停止动画、清空状态、重置画布和图表、启用控件。
        * `disableControls()`, `enableControls()`: 切换控件的可用状态。
        * `calculateDropInterval()`: 根据速度滑块的值计算小球下落的时间间隔。
    * **事件监听器**: 监听滑块的 `input` 事件以更新显示的值和相关参数（如果模拟未运行），监听按钮的 `click` 事件，监听窗口的 `resize` 事件。
    * **初始设置**: 页面加载时，设置滑块初始值，计算初始下落间隔，首次绘制画布和图表，并设置控件状态。

**如何使用:**

1.  将以上所有代码复制并粘贴到一个名为 `index.html` 的文件中。
2.  用现代浏览器（如 Chrome, Firefox, Edge, Safari）打开这个 `index.html` 文件。
3.  调整滑块来设置模拟参数。
4.  点击“开始模拟”按钮。
5.  观察小球下落并在底部形成近似正态分布的堆积，同时下方的条形图会实时（或定期）更新显示每个槽中的小球数量。
6.  可以在模拟过程中或结束后点击“重置”按钮来清除当前状态并重新开始。
7.  尝试在不同设备或调整浏览器窗口大小，观察页面布局的自适应效果。

这个模拟器直观地展示了随机事件（小球碰到钉子向左或向右）如何累积产生符合二项分布（当层数较少时）并趋近于正态分布（当小球数量和层数足够多时）的结果，体现了大数定律和中心极限定理的概念。