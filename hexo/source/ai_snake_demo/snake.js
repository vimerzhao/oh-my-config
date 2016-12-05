// ------------------------------------------------------------
// Creating A Snake Game Tutorial With HTML5
// Copyright (c) 2015 Rembound.com
// 
// This program is free software: you can redistribute it and/or modify  
// it under the terms of the GNU General Public License as published by  
// the Free Software Foundation, either version 3 of the License, or  
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,  
// but WITHOUT ANY WARRANTY; without even the implied warranty of  
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the  
// GNU General Public License for more details.  
// 
// You should have received a copy of the GNU General Public License  
// along with this program.  If not, see http://www.gnu.org/licenses/.
//
// http://rembound.com/articles/creating-a-snake-game-tutorial-with-html5
// ------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    var initialized = false;
    
    // Images
    var images = [];
    var tileimage;
    
    // Image loading global variables
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
    
    // Load images
    function loadImages(imagefiles) {
        // Initialize variables
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        
        // Load the images
        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
            // Create the image object
            var image = new Image();
            
            // Add onload event handler
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    // Done loading
                    preloaded = true;
                }
            };
            
            // Set the source url of the image
            image.src = imagefiles[i];
            
            // Save to the image array
            loadedimages[i] = image;
        }
        
        // Return an array of images
        return loadedimages;
    }
    
    // Level properties
    var Level = function (columns, rows, tilewidth, tileheight) {
        this.columns = columns;
        this.rows = rows;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        
        // Initialize tiles array
        this.tiles = [];
        for (var i=0; i<this.columns; i++) {
            this.tiles[i] = [];
            for (var j=0; j<this.rows; j++) {
                this.tiles[i][j] = 0;
            }
        }
    };
    
    // Generate a default level with walls
    Level.prototype.generate = function() {
        for (var i=0; i<this.columns; i++) {
            for (var j=0; j<this.rows; j++) {
                if (i == 0 || i == this.columns-1 ||
                    j == 0 || j == this.rows-1) {
                    // Add walls at the edges of the level
                    this.tiles[i][j] = 1;
                } else {
                    // Add empty space
                    this.tiles[i][j] = 0;
                }
            }
        }
    };
    
    
    // Snake
    var Snake = function() {
        this.init(0, 0, 1, 10, 1);
    }
    
    // Direction table: Up, Right, Down, Left
    Snake.prototype.directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    // Initialize the snake at a location
    Snake.prototype.init = function(x, y, direction, speed, numsegments) {
        this.x = x;
        this.y = y;
        this.direction = direction; // Up, Right, Down, Left
        this.speed = speed;         // Movement speed in blocks per second
        this.movedelay = 0;
        
        // Reset the segments and add new ones
        this.segments = [];
        this.growsegments = 0;
        for (var i=0; i<numsegments; i++) {
            this.segments.push({x:this.x - i*this.directions[direction][0],
                                y:this.y - i*this.directions[direction][1]});
        }
    }
    
    // Increase the segment count
    Snake.prototype.grow = function() {
        this.growsegments++;
    };
    
    // Check we are allowed to move
    Snake.prototype.tryMove = function(dt) {
        this.movedelay += dt;
        var maxmovedelay = 1 / this.speed;
        if (this.movedelay > maxmovedelay) {
            return true;
        }
        return false;
    };
    
    // Get the position of the next move
    Snake.prototype.nextMove = function() {
        var nextx = this.x + this.directions[this.direction][0];
        var nexty = this.y + this.directions[this.direction][1];
        return {x:nextx, y:nexty};
    }
    
    // Move the snake in the direction
    Snake.prototype.move = function() {
        // Get the next move and modify the position
        var nextmove = this.nextMove();
        this.x = nextmove.x;
        this.y = nextmove.y;
    
        // Get the position of the last segment
        var lastseg = this.segments[this.segments.length-1];
        var growx = lastseg.x;
        var growy = lastseg.y;
    
        // Move segments to the position of the previous segment
        for (var i=this.segments.length-1; i>=1; i--) {
            this.segments[i].x = this.segments[i-1].x;
            this.segments[i].y = this.segments[i-1].y;
        }
        
        // Grow a segment if needed
        if (this.growsegments > 0) {
            this.segments.push({x:growx, y:growy});
            this.growsegments--;
        }
        
        // Move the first segment
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        
        // Reset movedelay
        this.movedelay = 0;
    }

    // Create objects
    var snake = new Snake();
    var level = new Level(20, 15, 32, 32);
    
    // Variables
    var score = 0;              // Score
    var gameover = true;        // Game is over
    var gameovertime = 1;       // How long we have been game over
    var gameoverdelay = 0.5;    // Waiting time after game over
    
    // Initialize the game
    function init() {
        // Load images
        images = loadImages(["snake-graphics.png"]);
        tileimage = images[0];
    
        // Add mouse events
        canvas.addEventListener("mousedown", onMouseDown);
        
        // Add keyboard events
        document.addEventListener("keydown", onKeyDown);
        
        // New game
        newGame();
        gameover = true;
    
        // Enter main loop
        main(0);
    }
    
    // Check if we can start a new game
    function tryNewGame() {
        if (gameovertime > gameoverdelay) {
            newGame();
            gameover = false;
        }
    }
    
    function newGame() {
        // Initialize the snake
        snake.init(10, 10, 1, 80, 4);
        
        // Generate the default level
        level.generate();
        
        // Add an apple
        addApple();
        
        // Initialize the score
        score = 0;
        
        // Initialize variables
        gameover = false;
    }
    
    // Add an apple to the level at an empty position
    function addApple() {
        // Loop until we have a valid apple
        var valid = false;
        while (!valid) {
            // Get a random position
            var ax = randRange(0, level.columns-1);
            var ay = randRange(0, level.rows-1);
            
            // Make sure the snake doesn't overlap the new apple
            var overlap = false;
            for (var i=0; i<snake.segments.length; i++) {
                // Get the position of the current snake segment
                var sx = snake.segments[i].x;
                var sy = snake.segments[i].y;
                
                // Check overlap
                if (ax == sx && ay == sy) {
                    overlap = true;
                    break;
                }
            }
            
            // Tile must be empty
            if (!overlap && level.tiles[ax][ay] == 0) {
                // Add an apple at the tile position
                level.tiles[ax][ay] = 2;
                valid = true;
            }
        }
    }
    
    // Main loop
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);
        
        if (!initialized) {
            // Preloader
            
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw a progress bar
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
            // Draw the progress text
            var loadtext = "Loaded " + loadcount + "/" + loadtotal + " images";
            context.fillStyle = "#000000";
            context.font = "16px Verdana";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                initialized = true;
            }
        } else {
            // Update and render the game
            update(tframe);
            render();
        }
    }
    
    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // Update the fps counter
        updateFps(dt);
        
        if (!gameover) {
            updateGame(dt);
        } else {
            gameovertime += dt;
        }
    }
    
    function updateGame(dt) {
        // Move the snake
        if (snake.tryMove(dt)) {
            // Check snake collisions
            
            snake.aiSetDirection();
            // Get the coordinates of the next move
            var nextmove = snake.nextMove();
            var nx = nextmove.x;
            var ny = nextmove.y;
            
            if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
                if (level.tiles[nx][ny] == 1) {
                    // Collision with a wall
                    gameover = true;
                }
                
                // Collisions with the snake itself
                for (var i=0; i<snake.segments.length; i++) {
                    var sx = snake.segments[i].x;
                    var sy = snake.segments[i].y;
                    
                    if (nx == sx && ny == sy) {
                        // Found a snake part
                        gameover = true;
                        break;
                    }
                }
                
                if (!gameover) {
                    // The snake is allowed to move

                    if (level.tiles[nx][ny] == 2) {
                        // Grow the snake
                        snake.grow();
                        
                        // Add a point to the score
                        score++;
                    }
                    // Move the snake
                    snake.move();
                    
                    // Check collision with an apple
                    if (level.tiles[nx][ny] == 2) {
                        // Remove the apple
                        level.tiles[nx][ny] = 0;
                        
                        // Add a new apple
                        addApple();
                    }
                    

                }
            } else {
                // Out of bounds
                gameover = true;
            }
            
            if (gameover) {
                gameovertime = 0;
            }
        }
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);
            
            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }
        
        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }
    
    // Render the game
    function render() {
        // Draw background
        context.fillStyle = "#577ddb";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        drawLevel();
        drawSnake();
            
        // Game over
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Press any key to start!", 0, canvas.height/2, canvas.width);
        }
    }
    
    // Draw the level tiles
    function drawLevel() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Get the current tile and location
                var tile = level.tiles[i][j];
                var tilex = i*level.tilewidth;
                var tiley = j*level.tileheight;
                
                // Draw tiles based on their type
                if (tile == 0) {
                    // Empty space
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 1) {
                    // Wall
                    context.fillStyle = "#bcae76";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                } else if (tile == 2) {
                    // Apple
                    
                    // Draw apple background
                    context.fillStyle = "#f7e697";
                    context.fillRect(tilex, tiley, level.tilewidth, level.tileheight);
                    
                    // Draw the apple image
                    var tx = 0;
                    var ty = 3;
                    var tilew = 64;
                    var tileh = 64;
                    context.drawImage(tileimage, tx*tilew, ty*tileh, tilew, tileh, tilex, tiley, level.tilewidth, level.tileheight);
                }
            }
        }
        context.fillStyle = "#ffffff";
        var snakeLength = score+4;
        drawCenterText("蛇头:"+snake.x+"-"+snake.y+"   身长:"+snakeLength, 0, 25, canvas.width);
    }
    
    // Draw the snake
    function drawSnake() {
        // Loop over every snake segment
        for (var i=0; i<snake.segments.length; i++) {
            var segment = snake.segments[i];
            var segx = segment.x;
            var segy = segment.y;
            var tilex = segx*level.tilewidth;
            var tiley = segy*level.tileheight;
            
            // Sprite column and row that gets calculated
            var tx = 0;
            var ty = 0;
            
            if (i == 0) {
                // Head; Determine the correct image
                var nseg = snake.segments[i+1]; // Next segment
                if (segy < nseg.y) {
                    // Up
                    tx = 3; ty = 0;
                } else if (segx > nseg.x) {
                    // Right
                    tx = 4; ty = 0;
                } else if (segy > nseg.y) {
                    // Down
                    tx = 4; ty = 1;
                } else if (segx < nseg.x) {
                    // Left
                    tx = 3; ty = 1;
                }
            } else if (i == snake.segments.length-1) {
                // Tail; Determine the correct image
                var pseg = snake.segments[i-1]; // Prev segment
                if (pseg.y < segy) {
                    // Up
                    tx = 3; ty = 2;
                } else if (pseg.x > segx) {
                    // Right
                    tx = 4; ty = 2;
                } else if (pseg.y > segy) {
                    // Down
                    tx = 4; ty = 3;
                } else if (pseg.x < segx) {
                    // Left
                    tx = 3; ty = 3;
                }
            } else {
                // Body; Determine the correct image
                var pseg = snake.segments[i-1]; // Previous segment
                var nseg = snake.segments[i+1]; // Next segment
                if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                    // Horizontal Left-Right
                    tx = 1; ty = 0;
                } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                    // Angle Left-Down
                    tx = 2; ty = 0;
                } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                    // Vertical Up-Down
                    tx = 2; ty = 1;
                } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                    // Angle Top-Left
                    tx = 2; ty = 2;
                } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                    // Angle Right-Up
                    tx = 0; ty = 1;
                } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                    // Angle Down-Right
                    tx = 0; ty = 0;
                }
            }
            
            // Draw the image of the snake part
            context.drawImage(tileimage, tx*64, ty*64, 64, 64, tilex, tiley,
                              level.tilewidth, level.tileheight);
        }
    }
    
    // Draw text that is centered
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    // Get a random int between low and high, inclusive
    function randRange(low, high) {
        return Math.floor(low + Math.random()*(high-low+1));
    }
    
    // Mouse event handlers
    function onMouseDown(e) {
    if (gameover) {
            tryNewGame();
        } 
        snake.speed+=10;
    }
    
    // Keyboard event handler
    function onKeyDown(e) {
        if (gameover) {
            tryNewGame();
        } else {
            if (e.keyCode == 37 || e.keyCode == 65) {
                // Left or A
                if (snake.direction != 1)  {
                    snake.direction = 3;
                }
            } else if (e.keyCode == 38 || e.keyCode == 87) {
                // Up or W

                if (snake.direction != 2)  {
                    snake.direction = 0;
                }
            } else if (e.keyCode == 39 || e.keyCode == 68) {
                // Right or D
                if (snake.direction != 3)  {
                    snake.direction = 1;
                }
            } else if (e.keyCode == 40 || e.keyCode == 83) {
                // Down or S
                if (snake.direction != 0)  {
                    snake.direction = 2;
                }
            }
            
            // Grow for demonstration purposes
            if (e.keyCode == 32) {
                // snake.grow();
                snake.speed -= 10;
                if (snake.speed <0){snake.speed = 4}
            }
        }
    }
    
    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Call init to start the game
    init();


    /****************************AI begin******************************************/
    Snake.prototype.aiSetDirection = function() {
        snake.aiSetSituation();
        //约定：返回-1代表此策略失败

        //！！！！！！！！！注释：设定的值越高，出现死循环的可能性越大。
        newDirection = snake.aiGetPrePath_1();//按照预定路径走
        if (score > 190 && -1 != newDirection) {
            console.log("aiGetPrePath_1");
            console.log(newDirection);

            this.direction = newDirection;
            return;
        }
        newDirection = snake.aiGetPrePath_2();//按照预定路径走
        if (score > 190 && -1 != newDirection) {
            console.log("aiGetPrePath_2");
            console.log(newDirection);

            this.direction = newDirection;
            return;
        }       

        newDirection = snake.aiGetBestPath();//尝试直接沿最短路
        if (-1 != newDirection) {
            console.log("aiGetBestPath");
            this.direction = newDirection;
            return;
        }

        newDirection = snake.aiFollowTail();//尝试追着尾巴走
        if (-1 != newDirection) {
            console.log("aiFollowTail");
            this.direction = newDirection;
            console.log(newDirection);
            return;
        }
    }


    //ai获取当前局势
    Snake.prototype.aiSetSituation = function() {
        //0 空，墙1，Apple2，蛇3
        this.Situation = [];
        for (var x = 0; x < level.columns; x++) {
            this.Situation[x] = [];
            for (var y = 0; y < level.rows; y++) {
                this.Situation[x][y] = level.tiles[x][y];
                 
                if (2 == level.tiles[x][y]) {
                    this.Apple = {x: x, y: y};
                }
            }
        }
        //加入蛇
        for (var i in this.segments) {
            var part = this.segments[i];
            this.Situation[part.x][part.y] = 3;
        }
        //记录头尾两个比较特殊的位置
        this.snakeHead = this.segments[0];
        this.snakeTail = this.segments[this.segments.length - 1];
    }

    //获取最短路 A*算法
    Snake.prototype.aiGetBestPath = function() {
        //使用A*算法寻路
        var openList = [];
        var closeList = [];
        var result = [];//保存结果路径
        var canEatApple = false;
        var D = 10;//启发值
        openList.push({x: this.x, y: this.y, G: 0});
        do {
            var cur = openList.pop();
            closeList.push(cur);
            var aroudPoint = getAroundPoint(cur);
            
            for (var i in aroudPoint) {
                var selectedPoint = aroudPoint[i];
                if (selectedPoint.x > 0 && selectedPoint.y > 0 && //在leve内
                        selectedPoint.x < level.columns-1 && selectedPoint.y < level.rows-1 &&
                        1 != this.Situation[selectedPoint.x][selectedPoint.y] &&
                        3 != this.Situation[selectedPoint.x][selectedPoint.y] &&
                        !existList(selectedPoint, closeList)){ //不在关闭表中

                    var g = cur.G + 10;//移动一步代价为 10
                    if (!existList(selectedPoint, openList)) {//不在open表中

                        selectedPoint['H'] = D*(Math.abs(this.Apple.x - selectedPoint.x) + 
                            Math.abs(this.Apple.y - selectedPoint.y));
                        selectedPoint['G'] = g;
                        selectedPoint['F'] = selectedPoint.H + selectedPoint.G;
                        selectedPoint['Parent'] = cur;
                        openList.push(selectedPoint);
                    } else {//在open表中，
                        var index = getLocation(selectedPoint, openList);
                        if (index > -1) {
                            if (g < openList[index].G) {//g更小
                                openList[index].Parent = cur;
                                openList[index].G = g;
                                openList[index].F = g + openList[index].H;
                            }
                        } else {
                            console.log("error");
                        }
                    }
                }
            }
            if (0 == openList.length) {
                console.log("can't find");
                return -1;
            }

            openList.sort(sortF);
            canEatApple = existList({x:this.Apple.x ,y:this.Apple.y}, openList);
        } while (!canEatApple);

        if (canEatApple) {
            var currentObj = openList[getLocation({x:this.Apple.x ,y:this.Apple.y}, openList)];
            do{//把路劲节点添加到result当中
                result.unshift({x:currentObj.x , y:currentObj.y});
                currentObj=currentObj.Parent;
            }while (currentObj.x != this.x || currentObj.y != this.y);
        }//第一个位置就是头部下一位置，根据这个位置计算出方向        

        if (snake.aiJudgePath(result)) {
            return snake.aiTurnToDirection(result[0])
        } else {
            return -1;
        }

        function getLocation(point, list) {
         for(var i in list) {
                if(point.x==list[i].x && point.y==list[i].y) {
                    return i;
                }
            }
            return -1;   
        }

        function getAroundPoint(center) {
            var X = center.x;
            var Y = center.y;
            return [{x:X-1, y:Y}, {x:X, y:Y-1}, {x:X+1, y:Y}, {x:X, y:Y+1}];
        }

        function existList(select, list) {
            for(var i in list) {
                if(select.x==list[i].x && select.y==list[i].y) {
                    return true;
                }
            }
            return false;
        }   
        function sortF(a,b){
            return b.F - a.F;
        }
    }

    //追着尾巴
    Snake.prototype.aiFollowTail = function() {
        var canMove = [false, false, false, false]; 
        for (var i in this.directions) {
            var nextmove = {x: this.x+this.directions[i][0], y: this.y+this.directions[i][1]};
            if (0 == this.Situation[nextmove.x][nextmove.y]) {
                canMove[i] = snake.aiJudgePath([nextmove]);
            }
        }

        var Max = -1;
        var dir = -1;

        var DFS_distance = snake.aiDFSPath();
        for (var i in canMove) {
            if (canMove[i]) {
                if (DFS_distance[i] > Max) {
                    Max = DFS_distance[i];
                    dir = i;
                } else if (DFS_distance[i] == Max && Math.random() < 0.5) {//为了走出循环的困境
                    dir = i;
                }
            }
        }

        return dir;
    }


    Snake.prototype.aiGetPrePath_1 = function() {
        //不考虑变化，columns:20 rows:15---->x:1-18;y:1-13
        var preDirection = [];
        for (var x = 1; x < level.columns-1; x++) {
            preDirection[x] = [];
            for (var y = 1; y < level.rows - 1; y++) {
                if (1 == x % 2) {
                    preDirection[x][y] = 0;

                    if (2 == y && 1 != x) {
                        preDirection[x][y] = 3;
                    }

                } else {
                    preDirection[x][y] = 2;
                    if (13 == y) {
                        preDirection[x][y] = 3;
                    }
                }

                if (1 == y && 18 != x) {
                    preDirection[x][y] = 1;
                }
                
            }   
        }

        // console.log(preDirection);
        var dir = preDirection[this.x][this.y];
        var nextmove = {x: this.x+this.directions[dir][0], y: this.y+this.directions[dir][1]};

        this.Situation[this.Apple.x][this.Apple.y] = 0;

        if (0 != this.Situation[nextmove.x][nextmove.y]) {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return -1;
        }
        if (snake.aiJudgePath([nextmove])) {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return preDirection[this.snakeHead.x][this.snakeHead.y];
        } else {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return -1;
        }
    }
    //第二种必胜策略
    Snake.prototype.aiGetPrePath_2 = function() {
        //不考虑变化，columns:20 rows:15---->x:1-18;y:1-13
        var preDirection = [];
        for (var x = 1; x < level.columns-1; x++) {
            preDirection[x] = [];
            for (var y = 1; y < level.rows - 1; y++) {
                if (1 == x % 2) {
                    preDirection[x][y] = 2;

                    if (13 == y) {
                        preDirection[x][y] = 1;
                    }

                } else {
                    preDirection[x][y] = 0;
                    if (2 == y && x!=18) {
                        preDirection[x][y] = 1;
                    }
                }

                if (1 == y && 1 != x) {
                    preDirection[x][y] = 3;
                }
                
            }   
        }

        // console.log(preDirection);
        var dir = preDirection[this.x][this.y];
        var nextmove = {x: this.x+this.directions[dir][0], y: this.y+this.directions[dir][1]};

        this.Situation[this.Apple.x][this.Apple.y] = 0;

        if (0 != this.Situation[nextmove.x][nextmove.y]) {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return -1;
        }
        if (snake.aiJudgePath([nextmove])) {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return preDirection[this.snakeHead.x][this.snakeHead.y];
        } else {
            this.Situation[this.Apple.x][this.Apple.y] = 2;
            return -1;
        }
    }
    //判断路径是否可行
    //输入参数，路径数组，长度为1一般是后两种策略，判断是否可行
    //长度大于1一般是前两种策略，判断路径是否可行
    //最后判断部分逻辑的相同的
    Snake.prototype.aiJudgePath = function(path) {
        var virtualSnake = [];
        for (var i in this.segments) {
            var part = this.segments[i];
            virtualSnake[i] = {x: part.x, y: part.y};
        }
        if (path.length >= 1) {
            // console.log(path);
            
            //移动虚拟蛇
            for (var i = 0; i < path.length; i++) {//对于前两种策略，最后一个应该是Apple
                var part = path[i];
                virtualSnake.unshift({x: part.x, y: part.y});
                if (2 != this.Situation[part.x][part.y]) {
                    virtualSnake.pop();
                }
            }

            //判断虚拟蛇能否找到尾巴
            //不考虑食物的可能出现
            //BFS
            return BFS(virtualSnake);

        }
        return false;


        function BFS(virtual_snake) {
            var INF = 100000000;
            //虚拟格局
            var virtualTiles = [];
            for (var i = 0; i < level.columns; i++) {
                virtualTiles[i] = [];
                for (var j=0; j < level.rows; j++) {
                    if (1 == level.tiles[i][j]) {
                        virtualTiles[i][j] = 1;
                    } else {
                        virtualTiles[i][j] = 0;
                    }
                }
            }
            
            var virtualHead = {x: virtualSnake[0].x, y: virtualSnake[0].y};
            var virtualTail = {x: virtualSnake[virtualSnake.length-1].x, y: virtualSnake[virtualSnake.length-1].y};
            
            for (var i in virtualSnake) {
                virtualTiles[virtualSnake[i].x][virtualSnake[i].y] = 1;
            }


            var Distance = [];
            for (var i = 0; i < virtualTiles.length; i++) {
                Distance[i] = [];
                for (var j = 0; j < virtualTiles[0].length; j++) {
                    Distance[i][j] = INF;
                }    
            }
            Distance[virtualHead.x][virtualHead.y] = 0;

            var Q = new Array(virtualHead);
            var dir = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            while (Q.length != 0) {
                var cur = Q.shift();
                for (var i in dir) {
                    var nextX = cur.x + dir[i][0];
                    var nextY = cur.y + dir[i][1];
                    if (nextX > 0 && nextX < level.columns-1 && //范围内
                        nextY > 0 && nextY < level.rows-1 &&
                        INF == Distance[nextX][nextY] &&//未遍历
                        0 == virtualTiles[nextX][nextY]) {//不是障碍
                        Distance[nextX][nextY] = Distance[cur.x][cur.y] + 1;
                        Q.push({x: nextX, y: nextY});
                    }
                }
            }
            Distance[virtualHead.x][virtualHead.y] = INF;
            for (var i in dir) {
                var part = {x: virtualTail.x + dir[i][0], y :virtualTail.y + dir[i][1]};
                if (Distance[part.x][part.y] < INF) {
                    return true;
                }
            }
            return false;
        }
    }

    Snake.prototype.aiDFSPath = function() {        
        //DFS最深路,返回四个方向的最深可能
        var INF = 10000000;
        var DFS_distance = [0, 0, 0, 0];
        var temp_dir = this.directions;
        var temp_situation = this.Situation;

        for (var i in this.directions) {
            var nextx = this.x + this.directions[i][0];
            var nexty = this.y + this.directions[i][1];

            //判断路径走完后是否能找到尾巴
            var path = [];


            if (0 == this.Situation[nextx][nexty] || 0 == this.Situation[nextx][nexty]) {
                var visited = [];
                var Distance = [];  
                for (var x = 0; x < level.columns; x++) {
                    visited[x] = [];
                    Distance[x] = [];
                    for (var y = 0; y < level.rows; y++) {
                        visited[x][y] = false;
                        Distance[x][y] = INF;
                    }
                }   
                Distance[this.snakeTail.x][this.snakeTail.y] = 0;
                visited[this.snakeTail.x][this.snakeTail.y] = true;
                
                DFS({x: this.snakeTail.x, y:this.snakeTail.y});

                for (var x = 0; x < level.columns; x++) {
                    for (var y = 0; y < level.rows; y++) {
                        if (Distance[x][y] < INF && Distance[x][y] > DFS_distance[i]) {
                            DFS_distance[i] = Distance[x][y];
                        }
                    }
                }

            }
        }
        console.log(DFS_distance);
        return DFS_distance;
        function DFS(center) {
            visited[center.x][center.y] = true;
            path.push({x: center.x, y: center.y});


            for (var i in temp_dir) {
                var nextx = center.x + temp_dir[i][0];
                var nexty = center.y + temp_dir[i][1];
                if (0 == temp_situation[nextx][nexty] && !visited[nextx][nexty]) {
                    Distance[nextx][nexty] = Distance[center.x][center.y] + 1;
                    DFS({x: nextx, y: nexty});
                }
            }   
        }


    }

    Snake.prototype.aiTurnToDirection = function(nextStep) {
        if (nextStep.x == this.x) {
            if (nextStep.y < this.y) {
                return 0;
            } else {
                return 2;
            }
        } else {
            if (nextStep.x > this.x) {
                return 1;
            } else {
                return 3;
            }
        }
    }

    /****************************AI  end ******************************************/
};