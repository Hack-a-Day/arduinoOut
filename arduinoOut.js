window.onload = function() {
    var bod = {};
    var bgc = 0x000000;

    //Game, player, and obstacle sizes (constants)
    var GAME_X = 640; 
    var GAME_Y = 480;
    var BALL_X = 20;
    var BALL_Y = 20;
    var OB_Y_OFFSET = 75;
    var PADDLE_X = 90;
    var PADDLE_Y = 12;

    //Capture game events:
    var intervalID;
    var gameRunning = false;
    
    //Playing surface
    var canvasColor;
    var cursorColor = "#0000FF";
    var ctx;
    
    //Setup the ball
    var wrencher = new Image();            
    wrencher.src = "http://hackadaycom.files.wordpress.com/2014/03/jolly-wrencher.png";

    //Ball locations
    var skullX;
    var skullY;

    //Paddle locations
    var pLocX;
    var pLocY;

    //How fast the ball is moving
    var speedX;
    var speedY;

    //Obstacles 
        // image source:
        // http://commons.wikimedia.org/wiki/File:Arduino_Diecimila.jpg
    var ard = new Image();
    ard.src = "http://hackadaycom.files.wordpress.com/2014/03/arduinodiecimila.png"

    var cur_level = 0;

    var levels = new Array();
    levels[0] = new arduinoOutLevel(3,6,100,70,5,"#000000");
    levels[1] = new arduinoOutLevel(3,8,75,52,4,"#FF0000");

    var ob_space;
    var ob_width;
    var ob_height;
    var obstacles;

    function arduinoOutFillLevel(lv)
    {
        obstacles = new Array();
        for (var row=0; row<levels[lv].rows; row++)
        {
            for (var col=0; col<levels[lv].columns; col++)
            {
                obstacles[(row*levels[lv].columns) + col] = 
                    new arduinoOutBrick(
                        //left-offset    + Object width + Middle offsets    
                        ob_space + (ob_width * col) + (col * ob_space),
                        //top-offset+ Object height + Middle offsets
                        OB_Y_OFFSET + (ob_height * row) + (row * ob_space)
                        );
                        
            }
        }
    }

    bod.e = document;

    //Mouse wheel trap based on this example
    //http://blogs.sitepointstatic.com/examples/tech/mouse-wheel/index.html
    if (bod.e.addEventListener) {
        bod.e.addEventListener("mousewheel", MouseWheelHandler, false);
        bod.e.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    }
    else bod.e.attachEvent("onmousewheel", MouseWheelHandler);


    //Initialize the game
    arduinoOutInit();
    ctx.font = "32px Arial";
    ctx.fillStyle = "blue";
    ctx.fillText("Space to start",200,200);
    ctx.fillText("Scroll wheel (or arrows) to move",46,260);

    //Keyboard events
    window.onkeydown = function(e) {
        console.log("Key: %d",e.keyCode);
        if (gameRunning) {
            //Hack: Left is 37, right is 39
            //subtract 38 to get -1 or 1
            //multiply by a negative to
            //correct direction and applify the effect
            if (e.keyCode == 37 || e.keyCode == 39) { arduinoOutMovePaddle((e.keyCode-38)*-2); }
        }
        else
        {
            if (e.keyCode == 32) { runGame(); }
        }
        e.preventDefault();
    }

    function runGame() {
        gameRunning = true;
        arduinoOutInit();
        //window.scrollTo(0,100);    //Move the windows so you can see the game canvas
        //Start the game running
        intervalID = setInterval(arduinoOutGame,10); //Start the game
    }

    //Mouse Events
    function MouseWheelHandler(e) {
        if (gameRunning) {
            // cross-browser wheel delta
            var e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            arduinoOutMovePaddle(delta);
            e.preventDefault();    //Prevent windows from scrolling
        }
        else {    
            bgc = bgc + 0x111111;
            if (bgc == 0xFFFFFF) { 
                runGame();
            }
            else { document.body.style.background = "#" + ("000000" + bgc.toString(16,6)).slice(-6); }
        }
        
        return false;
    }

    function arduinoOutInit()
    {
        var c = document.getElementById("arduinoOut");
        c.width = GAME_X;
        c.height = GAME_Y;
        c.style.background = levels[cur_level].bgcolor;
        c.style.align="center";
        ctx = c.getContext("2d");

        //Setup Ball
        skullX = 5;
        skullY = 400;
        speedX = 2;
        speedY = -2;

        //Setup paddle
        pLocX = 220;
        pLocY = GAME_Y-PADDLE_Y-5;
        ctx.fillStyle=cursorColor;
        ctx.fillRect(pLocX,pLocY,PADDLE_X,PADDLE_Y);

        //Setup the obstacles
        ob_width = levels[cur_level].width;
        ob_height = levels[cur_level].height;
        ob_space = levels[cur_level].space;
        arduinoOutFillLevel(cur_level);
    
        ctx.fillStyle=cursorColor;
        for (var i=0; i<obstacles.length; i++)
        {
            //ctx.fillRect(obstacles[i].x,obstacles[i].y,ob_width,ob_height);
            ctx.drawImage(ard,obstacles[i].x,obstacles[i].y,ob_width,ob_height);
        }
    }

    function arduinoOutGame()
    {
        //Clear ball for moving
        ctx.clearRect(skullX,skullY,BALL_X,BALL_Y);

        //Switch directions?
        arduinoOutCollision();

        skullX += speedX;
        skullY += speedY;

        ctx.drawImage(wrencher,skullX,skullY,BALL_X,BALL_Y);

        
    }

    function arduinoOutCollision()
    {
        var collisionFlagX = false;
        var collisionFlagY = false;

        //Check boundaries
        if ((skullX+BALL_X >= GAME_X) || (skullX<=0)) { collisionFlagX = true; }
        if (skullY<=0) {  collisionFlagY = true; }
        if (skullY > GAME_Y)
        {
                ctx.font = "72px Arial";
                ctx.fillStyle = "red";
                ctx.fillText("You Lose",180,300);
                clearInterval(intervalID);
        }

        //Check paddle reflections
        if (skullY+BALL_Y >= pLocY) {
            if ((pLocX <= skullX && skullX<=pLocX+PADDLE_X)
                ||
                (pLocX <= skullX+BALL_X && skullX+BALL_X<=pLocX+PADDLE_X))
                {
                    //Redraw cursor because overlap ball erases portions of it
                    ctx.fillStyle=cursorColor;
                    ctx.fillRect(pLocX,pLocY,PADDLE_X,PADDLE_Y);
                    collisionFlagY = true;

                    //TODO: Adjust speed
                    var ballMed = skullX + (BALL_X/2);
                    var padLeft = pLocX + (PADDLE_X/3);
                    var padRight = pLocX + ((PADDLE_X/3)*2);
                    if (ballMed < padLeft) { changeSpeed(-1); }
                    else if (ballMed > padRight) { changeSpeed(1); }
                }
                
        }

        //Check obstacles
        for (var i=0; i<obstacles.length; i++)
        {
            if (obstacles[i].visible) {
                //Feels REALLY convoluted but works:
                if (((obstacles[i].y <= skullY && skullY <= obstacles[i].y+ob_height)
                    ||
                    (obstacles[i].y <= skullY+BALL_Y && skullY+BALL_Y <= obstacles[i].y+ob_height))
                    &&
                    ((obstacles[i].x <= skullX && skullX <= obstacles[i].x+ob_width)
                    ||
                    (obstacles[i].x <= skullX+BALL_X && skullX+BALL_X <= obstacles[i].x+ob_width)))
                {
                    if (speedX < 0)    //Hit left side of obstacle?
                    {
                        if (skullX-speedX > obstacles[i].x+ob_width)
                        {
                        obstacles[i].visible = false;
                        ctx.clearRect(obstacles[i].x,obstacles[i].y,ob_width,ob_height);
                        collisionFlagX = true;
                        }
                    }
                    if (speedX > 0) //Hit right side of obstacle?
                    {
                        if (skullX+BALL_X-speedX < obstacles[i].x)
                        {
                        obstacles[i].visible = false;
                        ctx.clearRect(obstacles[i].x,obstacles[i].y,ob_width,ob_height);
                        collisionFlagX = true;
                        }
                    }
                    if (speedY < 0) //Hit bottom of obstacle?
                    { 
                        if (skullY-speedY > obstacles[i].y+ob_height)
                        {
                        obstacles[i].visible = false;
                        ctx.clearRect(obstacles[i].x,obstacles[i].y,ob_width,ob_height);
                        collisionFlagY = true;
                        }
                    }
                    if (speedY > 0) //Hit top of obstacle?
                    {
                        if (skullY+BALL_Y-speedY < obstacles[i].y)
                        {
                        obstacles[i].visible = false;
                        ctx.clearRect(obstacles[i].x,obstacles[i].y,ob_width,ob_height);
                        collisionFlagY = true;
                        }
                    }
                    //Check if that was the last visible obstacle
                    if (isLevelComplete())
                    {
                        //Increment Level, Reset game, and return
                        ++cur_level;
                        if (cur_level >= levels.length)
                        {
                            victory();
                        }
                        else
                        {
                            //Erase paddle hack
                            ctx.clearRect(pLocX,pLocY,PADDLE_X,PADDLE_Y);
                            arduinoOutInit();
                        }
                        return;
                    }
                }
            }
        }

        //Bounce if there was a collision
        if (collisionFlagX) { speedX = -speedX; } //FIXME speed changes
        if (collisionFlagY) { speedY = -speedY; }//FIXME speed changes
    }

    function changeSpeed(amount) {
        speedX += amount;
        if (speedX < -5) { speedX = -5; }
        if (speedX > 5) {speedX = 5; }
    }

    function victory()
    {
        //TODO: Something when you win
    }

    function arduinoOutMovePaddle(delta) {
        //Clear paddle for moving
        ctx.clearRect(pLocX,pLocY,PADDLE_X,PADDLE_Y);

        //Move paddle
            //Subtracting delta so user experience is intuitive (paddle moves direction you'd expect)
            //Multiplying delta so that paddle moves relatively quickly
        pLocX -= delta*20; 
        if (pLocX < 0) { pLocX = 0; }
        if (pLocX+PADDLE_X > GAME_X) { pLocX = GAME_X - PADDLE_X; }

        //Redraw paddle
        ctx.fillStyle=cursorColor;
        ctx.fillRect(pLocX,pLocY,PADDLE_X,PADDLE_Y);
    }
    function arduinoOutBrick(x,y)
    {
        this.x = x;
        this.y = y;
        this.visible = true;
    }

    function arduinoOutLevel(rows,columns,width,height,space, bgcolor) {
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height;
        this.space = space;
        this.bgcolor = bgcolor;
    }

    function isLevelComplete() {
        for (var i=0; i<obstacles.length; i++)
        {
            if (obstacles[i].visible) { return false; }
        }
        return true;
    }
}
