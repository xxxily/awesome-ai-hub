请使用3dweb技术，帮我创建制作一个高尔顿板模拟器，更直观地理解概率、统计、正态分布、大数法则、二项分布等抽象数学概念

# 高尔顿板3D模拟器设计

我将帮你创建一个3D高尔顿板模拟器，这是一个很好的工具来直观展示概率、正态分布和大数法则等统计学概念。我们将使用Three.js库来实现3D效果。

首先，让我们创建基本的HTML文件结构：

```html:/Users/blaze/work/github/awesome-ai-hub/web/game/3DGaltonBoardSimulator/claude_3.7_sonnet/index.html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D高尔顿板模拟器</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        #container {
            position: absolute;
            width: 100%;
            height: 100%;
        }
        #info {
            position: absolute;
            top: 10px;
            width: 100%;
            text-align: center;
            color: white;
            z-index: 100;
            display: block;
        }
        #controls {
            position: absolute;
            top: 50px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            color: white;
            z-index: 100;
        }
        .slider-container {
            margin: 10px 0;
        }
        button {
            margin: 5px;
            padding: 8px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div id="info">
        <h1>3D高尔顿板模拟器</h1>
        <p>一个直观展示概率、正态分布和大数法则的交互式模拟器</p>
    </div>
    <div id="controls">
        <div class="slider-container">
            <label for="rows">钉子行数: <span id="rowValue">10</span></label>
            <input type="range" id="rows" min="5" max="20" value="10" step="1">
        </div>
        <div class="slider-container">
            <label for="ballCount">小球数量: <span id="ballValue">100</span></label>
            <input type="range" id="ballCount" min="10" max="1000" value="100" step="10">
        </div>
        <div class="slider-container">
            <label for="ballSpeed">小球速度: <span id="speedValue">1</span></label>
            <input type="range" id="ballSpeed" min="0.5" max="3" value="1" step="0.1">
        </div>
        <div class="slider-container">
            <label for="probability">向右概率: <span id="probValue">0.5</span></label>
            <input type="range" id="probability" min="0" max="1" value="0.5" step="0.05">
        </div>
        <button id="startBtn">开始模拟</button>
        <button id="resetBtn">重置</button>
        <div id="stats">
            <p>已投放小球: <span id="ballsDropped">0</span></p>
            <p>分布情况: <span id="distribution"></span></p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
    <script>
        // 场景设置
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);
        
        // 相机设置
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 15, 30);
        
        // 渲染器设置
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.getElementById('container').appendChild(renderer.domElement);
        
        // 控制器设置
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        // 光照设置
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        scene.add(directionalLight);
        
        // 材质设置
        const pegMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });
        const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
        const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, transparent: true, opacity: 0.8 });
        const binMaterial = new THREE.MeshStandardMaterial({ color: 0x66cc66, transparent: true, opacity: 0.6 });
        
        // 全局变量
        let pegs = [];
        let balls = [];
        let bins = [];
        let ballsInBins = [];
        let rowCount = 10;
        let ballCount = 100;
        let ballSpeed = 1;
        let probability = 0.5;
        let ballsDropped = 0;
        let isSimulating = false;
        let board;
        
        // 初始化UI控件
        document.getElementById('rows').addEventListener('input', function() {
            rowCount = parseInt(this.value);
            document.getElementById('rowValue').textContent = rowCount;
        });
        
        document.getElementById('ballCount').addEventListener('input', function() {
            ballCount = parseInt(this.value);
            document.getElementById('ballValue').textContent = ballCount;
        });
        
        document.getElementById('ballSpeed').addEventListener('input', function() {
            ballSpeed = parseFloat(this.value);
            document.getElementById('speedValue').textContent = ballSpeed;
        });
        
        document.getElementById('probability').addEventListener('input', function() {
            probability = parseFloat(this.value);
            document.getElementById('probValue').textContent = probability;
        });
        
        document.getElementById('startBtn').addEventListener('click', startSimulation);
        document.getElementById('resetBtn').addEventListener('click', resetSimulation);
        
        // 创建高尔顿板
        function createGaltonBoard() {
            // 清除现有的板
            if (board) scene.remove(board);
            
            // 创建新的组来包含所有元素
            board = new THREE.Group();
            
            // 创建背板
            const backboardGeometry = new THREE.BoxGeometry(rowCount * 2 + 4, rowCount * 2 + 10, 0.5);
            const backboard = new THREE.Mesh(backboardGeometry, boardMaterial);
            backboard.position.z = -1;
            backboard.receiveShadow = true;
            board.add(backboard);
            
            // 创建钉子
            pegs = [];
            for (let row = 0; row < rowCount; row++) {
                const pegsInRow = row + 1;
                for (let i = 0; i < pegsInRow; i++) {
                    const pegGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                    const peg = new THREE.Mesh(pegGeometry, pegMaterial);
                    
                    // 计算钉子位置
                    const xOffset = (pegsInRow - 1) * 0.5;
                    peg.position.x = (i - xOffset) * 2;
                    peg.position.y = row * -1.5;
                    peg.castShadow = true;
                    peg.receiveShadow = true;
                    
                    pegs.push(peg);
                    board.add(peg);
                }
            }
            
            // 创建收集箱
            bins = [];
            ballsInBins = new Array(rowCount + 1).fill(0);
            
            for (let i = 0; i <= rowCount; i++) {
                const binGeometry = new THREE.BoxGeometry(1.8, 5, 2);
                const bin = new THREE.Mesh(binGeometry, binMaterial);
                
                const xOffset = rowCount * 0.5;
                bin.position.x = (i - xOffset) * 2;
                bin.position.y = -rowCount * 1.5 - 2.5;
                bin.castShadow = true;
                bin.receiveShadow = true;
                
                bins.push(bin);
                board.add(bin);
            }
            
            scene.add(board);
        }
        
        // 创建小球
        function createBall() {
            const ballGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            ball.position.set(0, 5, 0);
            ball.castShadow = true;
            ball.receiveShadow = true;
            
            // 添加小球物理属性
            ball.velocity = new THREE.Vector3(0, 0, 0);
            ball.inBin = false;
            ball.path = []; // 记录小球的路径
            
            balls.push(ball);
            scene.add(ball);
            
            ballsDropped++;
            document.getElementById('ballsDropped').textContent = ballsDropped;
            
            return ball;
        }
        
        // 更新小球位置
        function updateBalls() {
            const gravity = new THREE.Vector3(0, -0.05 * ballSpeed, 0);
            
            for (let i = balls.length - 1; i >= 0; i--) {
                const ball = balls[i];
                
                if (ball.inBin) continue;
                
                // 应用重力
                ball.velocity.add(gravity);
                ball.position.add(ball.velocity);
                
                // 检测与钉子的碰撞
                for (const peg of pegs) {
                    const distance = ball.position.distanceTo(peg.position);
                    if (distance < 0.7) { // 小球半径 + 钉子半径
                        // 确定小球向左还是向右偏转
                        let goRight;
                        if (probability === 0.5) {
                            goRight = Math.random() < 0.5;
                        } else {
                            goRight = Math.random() < probability;
                        }
                        
                        // 根据偏转方向调整速度
                        const deflectionForce = goRight ? 0.1 : -0.1;
                        ball.velocity.x += deflectionForce;
                        
                        // 记录路径选择
                        ball.path.push(goRight ? 'R' : 'L');
                        
                        // 稍微弹起
                        ball.velocity.y = Math.abs(ball.velocity.y) * 0.3;
                        
                        // 防止多次碰撞同一个钉子
                        ball.position.y -= 0.2;
                    }
                }
                
                // 检测与收集箱的碰撞
                if (ball.position.y < -rowCount * 1.5) {
                    for (let j = 0; j < bins.length; j++) {
                        const bin = bins[j];
                        if (Math.abs(ball.position.x - bin.position.x) < 0.9) {
                            ball.position.x = bin.position.x; // 将球对齐到箱子中心
                            ball.position.y = bin.position.y + (Math.random() * 2 - 1); // 随机高度
                            ball.velocity.set(0, 0, 0);
                            ball.inBin = true;
                            ballsInBins[j]++;
                            updateDistributionDisplay();
                            break;
                        }
                    }
                }
                
                // 如果小球掉出边界，移除它
                if (ball.position.y < -50) {
                    scene.remove(ball);
                    balls.splice(i, 1);
                }
            }
        }
        
        // 更新分布显示
        function updateDistributionDisplay() {
            let distributionText = "";
            const maxBalls = Math.max(...ballsInBins);
            
            for (let i = 0; i < ballsInBins.length; i++) {
                const count = ballsInBins[i];
                const barLength = maxBalls > 0 ? Math.round((count / maxBalls) * 20) : 0;
                distributionText += `${i}: ${'█'.repeat(barLength)} (${count})<br>`;
            }
            
            document.getElementById('distribution').innerHTML = distributionText;
        }
        
        // 开始模拟
        function startSimulation() {
            if (isSimulating) return;
            
            resetSimulation();
            isSimulating = true;
            
            let ballsCreated = 0;
            
            function dropBall() {
                if (ballsCreated < ballCount && isSimulating) {
                    createBall();
                    ballsCreated++;
                    setTimeout(dropBall, 100 / ballSpeed);
                }
            }
            
            dropBall();
        }
        
        // 重置模拟
        function resetSimulation() {
            isSimulating = false;
            
            // 移除所有小球
            for (const ball of balls) {
                scene.remove(ball);
            }
            balls = [];
            
            // 重置计数
            ballsDropped = 0;
            document.getElementById('ballsDropped').textContent = ballsDropped;
            
            // 重建高尔顿板
            createGaltonBoard();
        }
        
        // 窗口大小调整
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 初始化
        createGaltonBoard();
        
        // 动画循环
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            updateBalls();
            renderer.render(scene, camera);
        }
        
        animate();
    </script>
</body>
</html>
```

## 功能说明

这个3D高尔顿板模拟器具有以下特点：

1. **可视化展示**：使用Three.js创建真实的3D环境，包括小球、钉子和收集箱
2. **交互控制**：
   - 调整钉子行数（5-20行）
   - 控制小球数量（10-1000个）
   - 调整小球下落速度
   - 设置小球向右偏转的概率（默认0.5，即50%）
3. **统计展示**：实时显示每个收集箱中小球的数量和分布情况
4. **物理模拟**：模拟小球下落、碰撞和反弹的物理效果

## 数学概念展示

通过这个模拟器，你可以直观地理解以下数学概念：

1. **二项分布**：每个小球在每个钉子处有p的概率向右，(1-p)的概率向左
2. **正态分布**：当概率p=0.5时，大量小球的最终分布近似正态分布
3. **大数定律**：随着小球数量增加，分布越来越接近理论分布
4. **概率**：通过调整向右概率，观察不同概率下的分布变化

你可以通过调整参数来观察不同条件下的分布情况，帮助理解这些抽象的数学概念。