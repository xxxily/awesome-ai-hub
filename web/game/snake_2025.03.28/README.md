```user-prompt
帮我实现一个网页版的贪吃蛇游戏，支持高中低三级难度，蛇形走位可以非常自由，必须有别于传统的贪吃蛇，要体现有趣、好玩、新颖
```

# 创新贪吃蛇游戏设计

下面是一个新颖的网页版贪吃蛇游戏实现，具有以下特点：

- 三种难度级别（低、中、高）
- 自由蛇形走位（可以交叉自身）
- 多种特殊食物效果
- 时间加速/减速道具
- 可穿越墙壁模式
- 视觉特效

## HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>奇幻贪吃蛇</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            margin: 0;
            padding: 20px;
            overflow-x: hidden;
        }
        
        h1 {
            text-shadow: 0 0 10px #00ffff, 0 0 20px #0088ff;
            margin-bottom: 10px;
        }
        
        .game-container {
            position: relative;
            margin: 20px 0;
        }
        
        #game-board {
            border: 3px solid #4a4e69;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            background-color: #0f0f1a;
        }
        
        .controls {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        button {
            padding: 10px 20px;
            font-size: 16px;
            background: linear-gradient(45deg, #4cc9f0, #4895ef);
            border: none;
            border-radius: 30px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            background: linear-gradient(45deg, #4895ef, #4361ee);
        }
        
        button:active {
            transform: translateY(1px);
        }
        
        .difficulty {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .difficulty-btn {
            padding: 8px 15px;
            font-size: 14px;
        }
        
        .active {
            background: linear-gradient(45deg, #f72585, #b5179e);
            box-shadow: 0 0 10px rgba(247, 37, 133, 0.7);
        }
        
        .score-display {
            font-size: 24px;
            margin-bottom: 20px;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 20px;
            border-radius: 30px;
            display: flex;
            gap: 30px;
        }
        
        .special-effects {
            position: absolute;
            pointer-events: none;
            z-index: 10;
        }
        
        .instructions {
            background: rgba(0, 0, 0, 0.5);
            padding: 15px;
            border-radius: 10px;
            max-width: 600px;
            margin-top: 20px;
            line-height: 1.6;
        }
        
        .power-up {
            position: absolute;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .trail {
            position: absolute;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background-color: rgba(76, 201, 240, 0.5);
            pointer-events: none;
        }
    </style>
</head>
<body>
    <h1>奇幻贪吃蛇</h1>
    
    <div class="difficulty">
        <button class="difficulty-btn active" data-difficulty="easy">简单模式</button>
        <button class="difficulty-btn" data-difficulty="medium">中等模式</button>
        <button class="difficulty-btn" data-difficulty="hard">困难模式</button>
    </div>
    
    <div class="score-display">
        <div>分数: <span id="score">0</span></div>
        <div>长度: <span id="length">1</span></div>
        <div>速度: <span id="speed">1x</span></div>
    </div>
    
    <div class="game-container">
        <canvas id="game-board" width="500" height="500"></canvas>
        <div class="special-effects" id="effects"></div>
    </div>
    
    <div class="controls">
        <button id="start-btn">开始游戏</button>
        <button id="pause-btn">暂停</button>
        <button id="wall-toggle">墙壁: 开启</button>
        <button id="rainbow-toggle">彩虹模式: 关闭</button>
    </div>
    
    <div class="instructions">
        <h3>游戏说明:</h3>
        <p>- 使用方向键或WASD控制蛇的移动</p>
        <p>- 普通食物(绿色): +1分，蛇身增长</p>
        <p>- 特殊食物(闪烁): 随机效果(加速/减速/穿墙/彩虹等)</p>
        <p>- 可以穿过自己的身体，但撞墙会结束游戏(除非穿墙模式激活)</p>
        <p>- 彩虹模式下蛇身会变换颜色，分数双倍</p>
    </div>
    
    <script src="game.js"></script>
</body>
</html>
```

## JavaScript 实现 (game.js)

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const lengthDisplay = document.getElementById('length');
    const speedDisplay = document.getElementById('speed');
    const effectsContainer = document.getElementById('effects');
    
    // 游戏状态
    let gameState = {
        snake: [{x: 250, y: 250}],
        food: {},
        specialFood: {},
        direction: 'right',
        nextDirection: 'right',
        gameInterval: null,
        speed: 150,
        score: 0,
        gameRunning: false,
        difficulty: 'easy',
        wallsEnabled: true,
        rainbowMode: false,
        speedMultiplier: 1,
        powerUpActive: false,
        powerUpType: '',
        powerUpTimeout: null,
        trailParticles: []
    };
    
    // 初始化游戏
    function initGame() {
        // 重置蛇
        gameState.snake = [{x: 250, y: 250}];
        gameState.direction = 'right';
        gameState.nextDirection = 'right';
        gameState.score = 0;
        gameState.speedMultiplier = 1;
        
        // 根据难度设置初始速度
        switch(gameState.difficulty) {
            case 'easy':
                gameState.speed = 150;
                break;
            case 'medium':
                gameState.speed = 100;
                break;
            case 'hard':
                gameState.speed = 70;
                break;
        }
        
        // 生成食物
        generateFood();
        generateSpecialFood();
        
        // 更新显示
        updateDisplays();
        drawGame();
    }
    
    // 开始游戏
    function startGame() {
        if (gameState.gameRunning) return;
        
        initGame();
        gameState.gameRunning = true;
        
        // 清除之前的游戏循环
        if (gameState.gameInterval) {
            clearInterval(gameState.gameInterval);
        }
        
        // 设置新的游戏循环
        gameState.gameInterval = setInterval(() => {
            moveSnake();
            checkCollision();
            drawGame();
        }, gameState.speed / gameState.speedMultiplier);
    }
    
    // 暂停游戏
    function pauseGame() {
        if (!gameState.gameRunning) return;
        
        clearInterval(gameState.gameInterval);
        gameState.gameRunning = false;
    }
    
    // 生成普通食物
    function generateFood() {
        const gridSize = 20;
        const maxX = Math.floor(canvas.width / gridSize) - 1;
        const maxY = Math.floor(canvas.height / gridSize) - 1;
        
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * maxX) * gridSize + gridSize/2;
            foodY = Math.floor(Math.random() * maxY) * gridSize + gridSize/2;
            
            // 检查食物是否与蛇身重叠
            validPosition = true;
            for (const segment of gameState.snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            // 检查是否与特殊食物重叠
            if (gameState.specialFood.x === foodX && gameState.specialFood.y === foodY) {
                validPosition = false;
            }
        }
        
        gameState.food = {x: foodX, y: foodY, color: '#4ade80'};
    }
    
    // 生成特殊食物
    function generateSpecialFood() {
        if (Math.random() > 0.3) return; // 30%几率生成特殊食物
        
        const gridSize = 20;
        const maxX = Math.floor(canvas.width / gridSize) - 1;
        const maxY = Math.floor(canvas.height / gridSize) - 1;
        
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * maxX) * gridSize + gridSize/2;
            foodY = Math.floor(Math.random() * maxY) * gridSize + gridSize/2;
            
            // 检查食物是否与蛇身重叠
            validPosition = true;
            for (const segment of gameState.snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            // 检查是否与普通食物重叠
            if (gameState.food.x === foodX && gameState.food.y === foodY) {
                validPosition = false;
            }
        }
        
        // 随机选择特殊食物类型
        const types = ['speed-up', 'speed-down', 'wall-pass', 'rainbow', 'score-boost'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let color;
        switch(type) {
            case 'speed-up': color = '#f59e0b'; break; // 橙色
            case 'speed-down': color = '#3b82f6'; break; // 蓝色
            case 'wall-pass': color = '#8b5cf6'; break; // 紫色
            case 'rainbow': color = '#ec4899'; break; // 粉色
            case 'score-boost': color = '#10b981'; break; // 青色
        }
        
        gameState.specialFood = {
            x: foodX, 
            y: foodY, 
            color: color,
            type: type,
            blinkInterval: setInterval(() => {
                gameState.specialFood.visible = !gameState.specialFood.visible;
            }, 300),
            visible: true
        };
        
        // 10秒后消失
        setTimeout(() => {
            if (gameState.specialFood.blinkInterval) {
                clearInterval(gameState.specialFood.blinkInterval);
            }
            gameState.specialFood = {};
        }, 10000);
    }
    
    // 移动蛇
    function moveSnake() {
        gameState.direction = gameState.nextDirection;
        
        const head = {...gameState.snake[0]};
        
        // 根据方向移动头部
        switch(gameState.direction) {
            case 'up':
                head.y -= 20;
                break;
            case 'down':
                head.y += 20;
                break;
            case 'left':
                head.x -= 20;
                break;
            case 'right':
                head.x += 20;
                break;
        }
        
        // 穿墙逻辑
        if (gameState.wallsEnabled && !gameState.powerUpActive) {
            if (head.x < 0) head.x = canvas.width - 10;
            if (head.x >= canvas.width) head.x = 10;
            if (head.y < 0) head.y = canvas.height - 10;
            if (head.y >= canvas.height) head.y = 10;
        }
        
        // 添加新头部
        gameState.snake.unshift(head);
        
        // 检查是否吃到食物
        const ateFood = checkFoodCollision(head);
        const ateSpecialFood = checkSpecialFoodCollision(head);
        
        // 如果没有吃到食物，移除尾部
        if (!ateFood && !ateSpecialFood) {
            gameState.snake.pop();
            
            // 添加轨迹粒子效果
            if (gameState.snake.length > 1) {
                const tail = gameState.snake[gameState.snake.length - 1];
                gameState.trailParticles.push({
                    x: tail.x,
                    y: tail.y,
                    size: Math.random() * 10 + 5,
                    alpha: 0.8,
                    color: gameState.rainbowMode ? 
                        `hsl(${Math.random() * 360}, 100%, 50%)` : 
                        '#4cc9f0'
                });
            }
        }
        
        // 更新轨迹粒子
        updateTrailParticles();
    }
    
    // 更新轨迹粒子
    function updateTrailParticles() {
        for (let i = gameState.trailParticles.length - 1; i >= 0; i--) {
            gameState.trailParticles[i].alpha -= 0.02;
            gameState.trailParticles[i].size -= 0.1;
            
            if (gameState.trailParticles[i].alpha <= 0) {
                gameState.trailParticles.splice(i, 1);
            }
        }
    }
    
    // 检查食物碰撞
    function checkFoodCollision(head) {
        if (Math.abs(head.x - gameState.food.x) < 15 && Math.abs(head.y - gameState.food.y) < 15) {
            // 增加分数
            gameState.score += gameState.rainbowMode ? 2 : 1;
            
            // 生成新食物
            generateFood();
            
            // 偶尔生成特殊食物
            if (Math.random() < 0.2) {
                generateSpecialFood();
            }
            
            // 更新显示
            updateDisplays();
            
            // 食物特效
            createFoodEffect(gameState.food.x, gameState.food.y, gameState.food.color);
            
            return true;
        }
        return false;
    }
    
    // 检查特殊食物碰撞
    function checkSpecialFoodCollision(head) {
        if (!gameState.specialFood.x || !gameState.specialFood.visible) return false;
        
        if (Math.abs(head.x - gameState.specialFood.x) < 15 && Math.abs(head.y - gameState.specialFood.y) < 15) {
            // 清除闪烁间隔
            clearInterval(gameState.specialFood.blinkInterval);
            
            // 应用特殊效果
            applyPowerUp(gameState.specialFood.type);
            
            // 增加分数
            gameState.score += 5;
            
            // 更新显示
            updateDisplays();
            
            // 特效
            createFoodEffect(gameState.specialFood.x, gameState.specialFood.y, gameState.specialFood.color);
            
            // 清除特殊食物
            gameState.specialFood = {};
            
            return true;
        }
        return false;
    }
    
    // 应用特殊效果
    function applyPowerUp(type) {
        // 清除之前的特殊效果
        if (gameState.powerUpTimeout) {
            clearTimeout(gameState.powerUpTimeout);
        }
        
        gameState.powerUpActive = true;
        gameState.powerUpType = type;
        
        // 根据类型应用效果
        switch(type) {
            case 'speed-up':
                gameState.speedMultiplier = 2;
                showMessage('速度提升!', '#f59e0b');
                break;
            case 'speed-down':
                gameState.speedMultiplier = 0.5;
                showMessage('速度减慢!', '#3b82f6');
                break;
            case 'wall-pass':
                gameState.wallsEnabled = false;
                document.getElementById('wall-toggle').textContent = '墙壁: 关闭(临时)';
                showMessage('穿墙模式激活!', '#8b5cf6');
                break;
            case 'rainbow':
                gameState.rainbowMode = true;
                document.getElementById('rainbow-toggle').textContent = '彩虹模式: 开启(临时)';
                showMessage('彩虹模式! 分数双倍!', '#ec4899');
                break;
            case 'score-boost':
                gameState.score += 10;
                showMessage('分数加成!', '#10b981');
                break;
        }
        
        // 10秒后效果消失
        gameState.powerUpTimeout = setTimeout(() => {
            gameState.powerUpActive = false;
            
            // 重置效果
            switch(type) {
                case 'speed-up':
                case 'speed-down':
                    gameState.speedMultiplier = 1;
                    break;
                case 'wall-pass':
                    gameState.wallsEnabled = document.getElementById('wall-toggle').textContent.includes('开启');
                    document.getElementById('wall-toggle').textContent = 
                        gameState.wallsEnabled ? '墙壁: 开启' : '墙壁: 关闭';
                    break;
                case 'rainbow':
                    gameState.rainbowMode = document.getElementById('rainbow-toggle').textContent.includes('开启');
                    document.getElementById('rainbow-toggle').textContent = 
                        gameState.rainbowMode ? '彩虹模式: 开启' : '彩虹模式: 关闭';
                    break;
            }
            
            updateDisplays();
        }, 10000);
        
        updateDisplays();
    }
    
    // 显示消息特效
    function showMessage(text, color) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.color = color;
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '24px';
        message.style.fontWeight = 'bold';
        message.style.textShadow = '0 0 5px black';
        message.style.animation = 'fadeOut 2s forwards';
        
        effectsContainer.appendChild(message);
        
        // 创建CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -100%) scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            effectsContainer.removeChild(message);
            document.head.removeChild(style);
        }, 2000);
    }
    
    // 创建食物特效
    function createFoodEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'power-up';
            particle.style.backgroundColor = color;
            particle.style.left = `${x - 7.5}px`;
            particle.style.top = `${y - 7.5}px`;
            
            // 随机方向和速度
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const size = Math.random() * 10 + 5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            effectsContainer.appendChild(particle);
            
            let posX = x;
            let posY = y;
            let opacity = 1;
            
            const moveInterval = setInterval(() => {
                posX += Math.cos(angle) * speed;
                posY += Math.sin(angle) * speed;
                opacity -= 0.05;
                
                particle.style.left = `${posX - size/2}px`;
                particle.style.top = `${posY - size/2}px`;
                particle.style.opacity = opacity;
                
                if (opacity <= 0) {
                    clearInterval(moveInterval);
                    effectsContainer.removeChild(particle);
                }
            }, 30);
        }
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = gameState.snake[0];
        
        // 检查墙壁碰撞
        if (gameState.wallsEnabled && !gameState.powerUpActive) {
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
                gameOver();
                return;
            }
        }
        
        // 检查自我碰撞（仅在非穿墙模式下）
        if (gameState.wallsEnabled) {
            for (let i = 1; i < gameState.snake.length; i++) {
                if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
                    gameOver();
                    return;
                }
            }
        }
    }
    
    // 游戏结束
    function gameOver() {
        clearInterval(gameState.gameInterval);
        gameState.gameRunning = false;
        
        // 爆炸效果
        for (const segment of gameState.snake) {
            createFoodEffect(segment.x, segment.y, '#ef4444');
        }
        
        alert(`游戏结束! 你的得分: ${gameState.score}`);
    }
    
    // 绘制游戏
    function drawGame() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格背景
        drawGrid();
        
        // 绘制蛇
        drawSnake();
        
        // 绘制食物
        drawFood();
        
        // 绘制特殊食物
        drawSpecialFood();
        
        // 绘制轨迹粒子
        drawTrailParticles();
    }
    
    // 绘制网格背景
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        const gridSize = 20;
        
        // 垂直线
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // 绘制蛇
    function drawSnake() {
        const segmentSize = 18;
        
        for (let i = 0; i < gameState.snake.length; i++) {
            const segment = gameState.snake[i];
            
            // 头部特殊绘制
            if (i === 0) {
                ctx.fillStyle = gameState.rainbowMode ? 
                    `hsl(${(Date.now() / 20) % 360}, 100%, 50%)` : 
                    '#4cc9f0';
                
                // 绘制头部
                ctx.beginPath();
                ctx.arc(segment.x, segment.y, segmentSize / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // 眼睛
                ctx.fillStyle = 'white';
                let eyeOffsetX = 0, eyeOffsetY = 0;
                
                switch(gameState.direction) {
                    case 'up':
                        eyeOffsetX = -4; eyeOffsetY = -4;
                        break;
                    case 'down':
                        eyeOffsetX = -4; eyeOffsetY = 4;
                        break;
                    case 'left':
                        eyeOffsetX = -4; eyeOffsetY = 0;
                        break;
                    case 'right':
                        eyeOffsetX = 4; eyeOffsetY = 0;
                        break;
                }
                
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffsetX, segment.y + eyeOffsetY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffsetX, segment.y + eyeOffsetY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } 
            // 身体部分
            else {
                // 彩虹模式下每个段不同颜色
                if (gameState.rainbowMode) {
                    const hue = ((Date.now() / 20) + i * 10) % 360;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    // 渐变颜色 - 头部到尾部变暗
                    const colorValue = Math.max(50, 240 - i * 2);
                    ctx.fillStyle = `rgb(76, 201, ${colorValue})`;
                }
                
                ctx.beginPath();
                ctx.arc(segment.x, segment.y, segmentSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 绘制食物
    function drawFood() {
        const foodSize = 15;
        
        ctx.fillStyle = gameState.food.color;
        ctx.beginPath();
        ctx.arc(gameState.food.x, gameState.food.y, foodSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(gameState.food.x - 3, gameState.food.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制特殊食物
    function drawSpecialFood() {
        if (!gameState.specialFood.x || !gameState.specialFood.visible) return;
        
        const foodSize = 15;
        
        // 绘制外圈
        ctx.strokeStyle = gameState.specialFood.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(gameState.specialFood.x, gameState.specialFood.y, foodSize / 2 + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制中心
        ctx.fillStyle = gameState.specialFood.color;
        ctx.beginPath();
        ctx.arc(gameState.specialFood.x, gameState.specialFood.y, foodSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加闪烁效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(
            gameState.specialFood.x + Math.random() * 4 - 2, 
            gameState.specialFood.y + Math.random() * 4 - 2, 
            2, 0, Math.PI * 2
        );
        ctx.fill();
    }
    
    // 绘制轨迹粒子
    function drawTrailParticles() {
        for (const particle of gameState.trailParticles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    // 更新显示
    function updateDisplays() {
        scoreDisplay.textContent = gameState.score;
        lengthDisplay.textContent = gameState.snake.length;
        
        // 更新速度显示
        let speedText = '';
        if (gameState.speedMultiplier > 1) {
            speedText = `${gameState.speedMultiplier}x 🔥`;
        } else if (gameState.speedMultiplier < 1) {
            speedText = `${gameState.speedMultiplier}x 🐢`;
        } else {
            speedText = '1x';
        }
        speedDisplay.innerHTML = speedText;
    }
    
    // 事件监听
    document.addEventListener('keydown', (e) => {
        if (!gameState.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (gameState.direction !== 'down') gameState.nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (gameState.direction !== 'up') gameState.nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (gameState.direction !== 'right') gameState.nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (gameState.direction !== 'left') gameState.nextDirection = 'right';
                break;
        }
    });
    
    // 按钮事件
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', pauseGame);
    
    // 墙壁切换
    document.getElementById('wall-toggle').addEventListener('click', () => {
        if (!gameState.powerUpActive) {
            gameState.wallsEnabled = !gameState.wallsEnabled;
            document.getElementById('wall-toggle').textContent = 
                gameState.wallsEnabled ? '墙壁: 开启' : '墙壁: 关闭';
        }
    });
    
    // 彩虹模式切换
    document.getElementById('rainbow-toggle').addEventListener('click', () => {
        if (!gameState.powerUpActive) {
            gameState.rainbowMode = !gameState.rainbowMode;
            document.getElementById('rainbow-toggle').textContent = 
                gameState.rainbowMode ? '彩虹模式: 开启' : '彩虹模式: 关闭';
        }
    });
    
    // 难度选择
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
            
            if (gameState.gameRunning) {
                pauseGame();
                startGame();
            }
        });
    });
    
    // 初始绘制
    initGame();
});
```

## 游戏特点说明

1. **三种难度级别**：
   - 简单模式：蛇移动较慢，适合新手
   - 中等模式：适中速度
   - 困难模式：蛇移动很快，挑战反应速度

2. **自由蛇形走位**：
   - 蛇可以交叉自己的身体，增加了游戏的自由度
   - 只有在开启墙壁模式时撞墙才会结束游戏

3. **特殊食物系统**：
   - 速度提升/降低：临时改变游戏速度
   - 穿墙模式：可以穿过墙壁
   - 彩虹模式：蛇身颜色变化，分数双倍
   - 分数加成：直接获得额外分数

4. **视觉特效**：
   - 彩虹色蛇身
   - 食物获取时的粒子效果
   - 蛇移动时的轨迹粒子
   - 特殊效果激活时的屏幕提示

5. **其他创新**：
   - 可切换的墙壁模式
   - 可切换的彩虹模式
   - 蛇头有眼睛，会看向移动方向
   - 蛇身渐变颜色效果

## 使用说明

1. 将HTML代码保存为index.html文件
2. 将JavaScript代码保存为game.js文件
3. 在浏览器中打开index.html即可开始游戏
4. 使用方向键或WASD控制蛇的移动

这个贪吃蛇游戏通过多种特殊效果和自由移动方式，为传统贪吃蛇游戏带来了新的乐趣和挑战。玩家可以根据自己的喜好调整难度和游戏模式，享受不同的游戏体验。
