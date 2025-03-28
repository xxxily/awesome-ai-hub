帮我用纯前端技术实现个创意版的俄罗斯方块游戏，效果要足够酷炫，可以不断给用户带来惊喜和快乐

# 炫彩俄罗斯方块 - 创意前端实现方案

下面我将为你设计一个充满惊喜的酷炫俄罗斯方块游戏，使用纯前端技术(HTML5, CSS3, JavaScript)实现。

## 核心创意功能

1. **动态背景**：根据游戏进度变化的粒子背景
2. **形状变形**：方块下落过程中会随机变形
3. **消除特效**：爆炸、彩虹波纹等多样化消除效果
4. **惊喜道具**：随机出现的特殊能力道具
5. **音效系统**：配合动作的动感音效
6. **情绪反馈**：根据玩家表现给出表情反馈

## HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炫彩俄罗斯方块</title>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        /* CSS部分将在下面单独展示 */
    </style>
</head>
<body>
    <div id="game-container">
        <canvas id="game-board"></canvas>
        <canvas id="background"></canvas>
        <canvas id="effects"></canvas>
        
        <div id="ui">
            <div id="score">0</div>
            <div id="level">1</div>
            <div id="next-piece"></div>
            <div id="message"></div>
            <div id="emoji-feedback">😊</div>
            <button id="start-btn">开始游戏</button>
        </div>
    </div>
    
    <audio id="clear-sound" src="clear.wav"></audio>
    <audio id="rotate-sound" src="rotate.wav"></audio>
    <audio id="move-sound" src="move.wav"></audio>
    <audio id="drop-sound" src="drop.wav"></audio>
    <audio id="gameover-sound" src="gameover.wav"></audio>
    
    <script>
        // JavaScript部分将在下面详细展示
    </script>
</body>
</html>
```

## CSS 样式

```css
body {
    margin: 0;
    padding: 0;
    background: #000;
    overflow: hidden;
    font-family: 'Press Start 2P', cursive;
    color: white;
}

#game-container {
    position: relative;
    width: 800px;
    height: 600px;
    margin: 20px auto;
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
}

#game-board {
    z-index: 2;
    background-color: rgba(0, 0, 0, 0.7);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

#background {
    z-index: 1;
}

#effects {
    z-index: 3;
    pointer-events: none;
}

#ui {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    z-index: 4;
    text-align: center;
}

#score, #level {
    font-size: 24px;
    margin: 20px 0;
    text-shadow: 0 0 10px #fff;
}

#next-piece {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid #fff;
}

#message {
    font-size: 18px;
    height: 60px;
    margin: 20px 0;
    color: #ff0;
    text-shadow: 0 0 5px #ff0;
    animation: pulse 1.5s infinite;
}

#emoji-feedback {
    font-size: 50px;
    margin: 20px 0;
    transition: transform 0.3s;
}

#start-btn {
    background: linear-gradient(45deg, #ff3366, #ff8a00);
    border: none;
    color: white;
    padding: 15px 30px;
    font-family: 'Press Start 2P', cursive;
    font-size: 16px;
    cursor: pointer;
    border-radius: 50px;
    box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
    transition: all 0.3s;
}

#start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(255, 51, 102, 0.9);
}

@keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
}
```

## JavaScript 实现

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const COLORS = [
        '#FF0D72', '#0DC2FF', '#0DFF72', 
        '#F538FF', '#FF8E0D', '#FFE138', 
        '#3877FF', '#00FFAA', '#FF00AA'
    ];
    
    // 游戏变量
    let canvas, ctx;
    let bgCanvas, bgCtx;
    let effectsCanvas, effectsCtx;
    let board = [];
    let currentPiece, nextPiece;
    let score = 0;
    let level = 1;
    let gameOver = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let particles = [];
    let powerUps = [];
    let messages = [
        "太棒了!", "不可思议!", "哇塞!", 
        "继续加油!", "你是天才!", "难以置信!",
        "完美!", "绝了!", "666!"
    ];
    let emojis = ['😊', '😎', '🤩', '🔥', '🚀', '🎮', '👑', '💯'];
    
    // 初始化游戏
    function init() {
        canvas = document.getElementById('game-board');
        ctx = canvas.getContext('2d');
        bgCanvas = document.getElementById('background');
        bgCtx = bgCanvas.getContext('2d');
        effectsCanvas = document.getElementById('effects');
        effectsCtx = effectsCanvas.getContext('2d');
        
        // 设置画布大小
        canvas.width = COLS * BLOCK_SIZE;
        canvas.height = ROWS * BLOCK_SIZE;
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        effectsCanvas.width = canvas.width;
        effectsCanvas.height = canvas.height;
        
        // 初始化游戏板
        createBoard();
        
        // 创建第一个方块
        currentPiece = createPiece();
        nextPiece = createPiece();
        updateNextPieceDisplay();
        
        // 设置事件监听
        document.addEventListener('keydown', handleKeyPress);
        document.getElementById('start-btn').addEventListener('click', startGame);
        
        // 开始游戏循环
        requestAnimationFrame(gameLoop);
        
        // 初始化背景动画
        initBackground();
    }
    
    // 创建游戏板
    function createBoard() {
        board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    }
    
    // 创建新方块
    function createPiece() {
        // 标准俄罗斯方块形状
        const pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
        
        // 随机选择形状和颜色
        const randomIndex = Math.floor(Math.random() * pieces.length);
        const piece = {
            shape: pieces[randomIndex],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            pos: {x: Math.floor(COLS / 2) - 1, y: 0},
            rotation: 0
        };
        
        // 10%几率创建变形方块
        if (Math.random() < 0.1) {
            piece.morphing = true;
            piece.morphInterval = Math.floor(Math.random() * 30) + 30;
            piece.morphCounter = 0;
        }
        
        // 5%几率创建特殊道具
        if (Math.random() < 0.05) {
            piece.powerUp = getRandomPowerUp();
        }
        
        return piece;
    }
    
    // 获取随机道具
    function getRandomPowerUp() {
        const powerUps = [
            {type: 'clear', color: '#FFFFFF', effect: '清除一行'},
            {type: 'bomb', color: '#FF0000', effect: '爆炸清除周围'},
            {type: 'slow', color: '#00FFFF', effect: '减速'},
            {type: 'points', color: '#FFFF00', effect: '双倍分数'},
            {type: 'rainbow', color: 'rainbow', effect: '彩虹行'}
        ];
        return powerUps[Math.floor(Math.random() * powerUps.length)];
    }
    
    // 更新下一个方块的显示
    function updateNextPieceDisplay() {
        const nextPieceDiv = document.getElementById('next-piece');
        nextPieceDiv.innerHTML = '';
        
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 120;
        previewCanvas.height = 120;
        const previewCtx = previewCanvas.getContext('2d');
        
        // 绘制下一个方块
        const blockSize = 30;
        const offsetX = (120 - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (120 - nextPiece.shape.length * blockSize) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(previewCtx, x * blockSize + offsetX, y * blockSize + offsetY, 
                             blockSize, nextPiece.color, true);
                    
                    // 如果是变形方块，添加特效
                    if (nextPiece.morphing) {
                        previewCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        previewCtx.beginPath();
                        previewCtx.arc(
                            x * blockSize + offsetX + blockSize/2, 
                            y * blockSize + offsetY + blockSize/2, 
                            blockSize/3, 0, Math.PI * 2
                        );
                        previewCtx.fill();
                    }
                    
                    // 如果是道具方块，添加标记
                    if (nextPiece.powerUp) {
                        previewCtx.fillStyle = 'white';
                        previewCtx.font = 'bold 12px Arial';
                        previewCtx.textAlign = 'center';
                        previewCtx.textBaseline = 'middle';
                        previewCtx.fillText(
                            nextPiece.powerUp.type.charAt(0).toUpperCase(),
                            x * blockSize + offsetX + blockSize/2,
                            y * blockSize + offsetY + blockSize/2
                        );
                    }
                }
            });
        });
        
        nextPieceDiv.appendChild(previewCanvas);
    }
    
    // 绘制方块
    function drawBlock(ctx, x, y, size, color, isPreview = false) {
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, lightenColor(color, 30));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);
        
        if (!isPreview) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
            
            // 添加高光效果
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size * 0.7, y);
            ctx.lineTo(x, y + size * 0.7);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // 颜色变亮函数
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // 绘制游戏板
    function draw() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制已放置的方块
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, value);
                }
            });
        });
        
        // 绘制当前方块
        if (currentPiece) {
            currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        // 如果是变形方块，添加脉动效果
                        let size = BLOCK_SIZE;
                        if (currentPiece.morphing) {
                            const pulse = Math.sin(Date.now() / 200) * 3;
                            size = BLOCK_SIZE + pulse;
                        }
                        
                        const drawX = (currentPiece.pos.x + x) * BLOCK_SIZE;
                        const drawY = (currentPiece.pos.y + y) * BLOCK_SIZE;
                        
                        drawBlock(
                            ctx, 
                            drawX + (BLOCK_SIZE - size) / 2, 
                            drawY + (BLOCK_SIZE - size) / 2, 
                            size, 
                            currentPiece.color
                        );
                        
                        // 如果是道具方块，添加标记
                        if (currentPiece.powerUp) {
                            ctx.fillStyle = 'white';
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(
                                currentPiece.powerUp.type.charAt(0).toUpperCase(),
                                drawX + BLOCK_SIZE/2,
                                drawY + BLOCK_SIZE/2
                            );
                        }
                    }
                });
            });
        }
    }
    
    // 游戏主循环
    function gameLoop(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        // 更新游戏状态
        update(deltaTime);
        
        // 绘制游戏
        draw();
        drawBackground();
        drawEffects();
        
        // 继续循环
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // 更新游戏状态
    function update(deltaTime) {
        // 更新下落计数器
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            moveDown();
            dropCounter = 0;
        }
        
        // 更新变形方块的形状
        if (currentPiece && currentPiece.morphing) {
            currentPiece.morphCounter++;
            if (currentPiece.morphCounter >= currentPiece.morphInterval) {
                morphPiece(currentPiece);
                currentPiece.morphCounter = 0;
                playSound('rotate-sound');
            }
        }
        
        // 更新粒子效果
        updateParticles();
        
        // 更新道具效果
        updatePowerUps();
    }
    
    // 变形方块
    function morphPiece(piece) {
        const newShape = Array.from({length: piece.shape.length}, 
            () => Array(piece.shape[0].length).fill(0));
        
        // 随机生成新形状
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                newShape[y][x] = Math.random() > 0.3 ? 1 : 0;
            }
        }
        
        // 确保至少有一个方块
        if (newShape.flat().every(cell => cell === 0)) {
            newShape[0][0] = 1;
        }
        
        piece.shape = newShape;
    }
    
    // 移动方块
    function moveDown() {
        currentPiece.pos.y++;
        
        if (isCollision()) {
            currentPiece.pos.y--;
            placePiece();
            playSound('drop-sound');
            
            // 检查是否有完整的行
            const linesCleared = clearLines();
            if (linesCleared > 0) {
                updateScore(linesCleared);
                showMessage(messages[Math.floor(Math.random() * messages.length)]);
                updateEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
                playSound('clear-sound');
                createLineClearEffect(linesCleared);
            }
            
            // 生成新方块
            currentPiece = nextPiece;
            nextPiece = createPiece();
            updateNextPieceDisplay();
            
            // 检查游戏结束
            if (isCollision()) {
                gameOver = true;
                showMessage("游戏结束!");
                updateEmoji("😵");
                playSound('gameover-sound');
                createGameOverEffect();
            }
        }
        
        dropCounter = 0;
    }
    
    // 向左移动
    function moveLeft() {
        currentPiece.pos.x--;
        if (isCollision()) {
            currentPiece.pos.x++;
        } else {
            playSound('move-sound');
        }
    }
    
    // 向右移动
    function moveRight() {
        currentPiece.pos.x++;
        if (isCollision()) {
            currentPiece.pos.x--;
        } else {
            playSound('move-sound');
        }
    }
    
    // 旋转方块
    function rotate() {
        const originalShape = currentPiece.shape;
        const rows = currentPiece.shape.length;
        const cols = currentPiece.shape[0].length;
        
        // 转置矩阵
        const rotated = Array.from({length: cols}, (_, y) => 
            Array.from({length: rows}, (_, x) => currentPiece.shape[rows - 1 - x][y])
        );
        
        currentPiece.shape = rotated;
        if (isCollision()) {
            currentPiece.shape = originalShape;
        } else {
            playSound('rotate-sound');
        }
    }
    
    // 检查碰撞
    function isCollision() {
        return currentPiece.shape.some((row, y) => {
            return row.some((value, x) => {
                return value !== 0 && (
                    currentPiece.pos.y + y >= ROWS ||
                    currentPiece.pos.x + x < 0 ||
                    currentPiece.pos.x + x >= COLS ||
                    (board[currentPiece.pos.y + y] && 
                     board[currentPiece.pos.y + y][currentPiece.pos.x + x])
                );
            });
        });
    }
    
    // 放置方块
    function placePiece() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value && currentPiece.pos.y + y >= 0) {
                    board[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.color;
                    
                    // 如果是道具方块，激活效果
                    if (currentPiece.powerUp) {
                        activatePowerUp(currentPiece.powerUp, currentPiece.pos.x + x, currentPiece.pos.y + y);
                    }
                }
            });
        });
    }
    
    // 激活道具效果
    function activatePowerUp(powerUp, x, y) {
        switch (powerUp.type) {
            case 'clear':
                // 清除一行
                for (let i = 0; i < COLS; i++) {
                    board[y][i] = 0;
                }
                createExplosionEffect(x * BLOCK_SIZE + BLOCK_SIZE/2, y * BLOCK_SIZE + BLOCK_SIZE/2, 10);
                updateScore(COLS);
                break;
                
            case 'bomb':
                // 爆炸清除周围方块
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
                            if (board[ny][nx]) {
                                board[ny][nx] = 0;
                            }
                        }
                    }
                }
                createExplosionEffect(x * BLOCK_SIZE + BLOCK_SIZE/2, y * BLOCK_SIZE + BLOCK_SIZE/2, 20);
                updateScore(5);
                break;
                
            case 'slow':
                // 减速
                dropInterval = 2000;
                setTimeout(() => {
                    dropInterval = 1000 - (level - 1) * 50;
                }, 5000);
                break;
                
            case 'points':
                // 双倍分数
                const bonus = Math.floor(Math.random() * 100) + 50;
                updateScore(bonus);
                createTextEffect(`+${bonus}!`, x * BLOCK_SIZE, y * BLOCK_SIZE, '#FFFF00');
                break;
                
            case 'rainbow':
                // 彩虹行
                for (let i = 0; i < COLS; i++) {
                    if (board[y][i]) {
                        board[y][i] = COLORS[Math.floor(Math.random() * COLORS.length)];
                    }
                }
                createRainbowEffect(y);
                break;
        }
        
        showMessage(`激活: ${powerUp.effect}!`);
    }
    
    // 清除完整的行
    function clearLines() {
        let linesCleared = 0;
        
        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== 0)) {
                // 移除该行
                board.splice(y, 1);
                // 在顶部添加新行
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // 重新检查当前行
            }
        }
        
        return linesCleared;
    }
    
    // 更新分数
    function updateScore(lines) {
        const points = lines * lines * 100 * level;
        score += points;
        document.getElementById('score').textContent = score;
        
        // 每1000分升一级
        const newLevel = Math.floor(score / 1000) + 1;
        if (newLevel > level) {
            level = newLevel;
            document.getElementById('level').textContent = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 50);
            showMessage(`升级到 ${level} 级!`);
        }
    }
    
    // 显示消息
    function showMessage(msg) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = msg;
        messageEl.style.animation = 'none';
        void messageEl.offsetWidth; // 触发重绘
        messageEl.style.animation = 'pulse 1.5s infinite';
    }
    
    // 更新表情反馈
    function updateEmoji(emoji) {
        const emojiEl = document.getElementById('emoji-feedback');
        emojiEl.textContent = emoji;
        emojiEl.style.transform = 'scale(1.5)';
        setTimeout(() => {
            emojiEl.style.transform = 'scale(1)';
        }, 300);
    }
    
    // 播放音效
    function playSound(id) {
        const sound = document.getElementById(id);
        sound.currentTime = 0;
        sound.play();
    }
    
    // 处理按键
    function handleKeyPress(e) {
        if (gameOver) return;
        
        switch (e.keyCode) {
            case 37: // 左箭头
                moveLeft();
                break;
            case 39: // 右箭头
                moveRight();
                break;
            case 40: // 下箭头
                moveDown();
                break;
            case 38: // 上箭头
                rotate();
                break;
            case 32: // 空格
                hardDrop();
                break;
        }
    }
    
    // 硬降落
    function hardDrop() {
        while (!isCollision()) {
            currentPiece.pos.y++;
        }
        currentPiece.pos.y--;
        placePiece();
        playSound('drop-sound');
        
        const linesCleared = clearLines();
        if (linesCleared > 0) {
            updateScore(linesCleared);
            showMessage(messages[Math.floor(Math.random() * messages.length)]);
            updateEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
            playSound('clear-sound');
            createLineClearEffect(linesCleared);
        }
        
        currentPiece = nextPiece;
        nextPiece = createPiece();
        updateNextPieceDisplay();
        
        if (isCollision()) {
            gameOver = true;
            showMessage("游戏结束!");
            updateEmoji("😵");
            playSound('gameover-sound');
            createGameOverEffect();
        }
        
        dropCounter = 0;
    }
    
    // 开始游戏
    function startGame() {
        if (gameOver) {
            createBoard();
            score = 0;
            level = 1;
            gameOver = false;
            dropInterval = 1000;
            document.getElementById('score').textContent = '0';
            document.getElementById('level').textContent = '1';
            document.getElementById('message').textContent = '';
            updateEmoji('😊');
            
            currentPiece = createPiece();
            nextPiece = createPiece();
            updateNextPieceDisplay();
            
            lastTime = 0;
            dropCounter = 0;
            requestAnimationFrame(gameLoop);
        }
    }
    
    // 背景效果
    function initBackground() {
        // 创建背景粒子
        particles = Array.from({length: 50}, () => ({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.5 + 0.1
        }));
    }
    
    // 更新背景粒子
    function updateParticles() {
        particles.forEach(p => {
            p.y += p.speed;
            if (p.y > bgCanvas.height) {
                p.y = 0;
                p.x = Math.random() * bgCanvas.width;
            }
        });
    }
    
    // 绘制背景
    function drawBackground() {
        bgCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particles.forEach(p => {
            bgCtx.fillStyle = p.color;
            bgCtx.globalAlpha = p.alpha;
            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            bgCtx.fill();
        });
        
        bgCtx.globalAlpha = 1;
    }
    
    // 绘制特效
    function drawEffects() {
        effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
        
        // 绘制粒子效果
        powerUps.forEach(pu => {
            if (pu.particles) {
                pu.particles.forEach(p => {
                    effectsCtx.fillStyle = p.color;
                    effectsCtx.globalAlpha = p.alpha;
                    effectsCtx.beginPath();
                    effectsCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    effectsCtx.fill();
                });
            }
        });
        
        effectsCtx.globalAlpha = 1;
    }
    
    // 更新道具效果
    function updatePowerUps() {
        powerUps = powerUps.filter(pu => {
            if (pu.particles) {
                pu.particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= 0.01;
                    p.size *= 0.98;
                });
                
                pu.particles = pu.particles.filter(p => p.alpha > 0);
                return pu.particles.length > 0;
            }
            return false;
        });
    }
    
    // 创建消除行特效
    function createLineClearEffect(lines) {
        const effect = {
            particles: []
        };
        
        for (let i = 0; i < lines * 50; i++) {
            effect.particles.push({
                x: Math.random() * canvas.width,
                y: ROWS * BLOCK_SIZE - (lines * BLOCK_SIZE) + Math.random() * (lines * BLOCK_SIZE),
                size: Math.random() * 5 + 2,
                vx: Math.random() * 6 - 3,
                vy: Math.random() * -10 - 5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: 1
            });
        }
        
        powerUps.push(effect);
    }
    
    // 创建爆炸特效
    function createExplosionEffect(x, y, count) {
        const effect = {
            particles: []
        };
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            
            effect.particles.push({
                x: x,
                y: y,
                size: Math.random() * 8 + 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: 1
            });
        }
        
        powerUps.push(effect);
    }
    
    // 创建彩虹特效
    function createRainbowEffect(row) {
        const effect = {
            particles: []
        };
        
        for (let i = 0; i < 100; i++) {
            effect.particles.push({
                x: Math.random() * canvas.width,
                y: row * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                size: Math.random() * 4 + 2,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * -4 - 2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: 0.8
            });
        }
        
        powerUps.push(effect);
    }
    
    // 创建文本特效
    function createTextEffect(text, x, y, color) {
        const effect = {
            particles: []
        };
        
        for (let i = 0; i < 20; i++) {
            effect.particles.push({
                x: x + Math.random() * 50,
                y: y + Math.random() * 30,
                size: Math.random() * 10 + 5,
                vx: 0,
                vy: -1 - Math.random() * 2,
                color: color,
                alpha: 1,
                text: text
            });
        }
        
        powerUps.push(effect);
    }
    
    // 创建游戏结束特效
    function createGameOverEffect() {
        const effect = {
            particles: []
        };
        
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 5;
            
            effect.particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                size: Math.random() * 10 + 5,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: 1
            });
        }
        
        powerUps.push(effect);
    }
    
    // 初始化游戏
    init();
});
```

## 音效资源

你需要准备以下音效文件并放在同一目录下：
- clear.wav (消除行音效)
- rotate.wav (旋转音效)
- move.wav (移动音效)
- drop.wav (下落音效)
- gameover.wav (游戏结束音效)

可以从免费音效网站如 https://freesound.org/ 获取这些音效。

## 游戏特色说明

1. **变形方块**：10%的方块会在下落过程中不断变形
2. **特殊道具**：5%的方块带有特殊能力，如清除行、爆炸、双倍分数等
3. **动态背景**：彩色粒子背景随游戏进行而变化
4. **消除特效**：消除行时会产生彩色粒子爆炸效果
5. **情绪反馈**：根据玩家表现显示不同表情
6. **随机消息**：游戏过程中会显示鼓励性消息
7. **音效系统**：每个动作都有对应的音效反馈
8. **升级系统**：分数越高，游戏速度越快

## 如何扩展

1. 添加更多形状和变形模式
2. 增加更多特殊道具和能力
3. 实现多人对战模式
4. 添加成就系统
5. 增加主题切换功能
6. 实现本地存储高分榜

这个游戏使用了纯前端技术实现，无需后端支持，可以直接在浏览器中运行。希望这个创意版的俄罗斯方块能给用户带来不断的惊喜和快乐！