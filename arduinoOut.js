window.onload = function() {
	
	var bod = {};
	var bgc = 0x000000;

	//Game, player, and obstacle sizes (constants)
	var GAME_X = 640; 
	var GAME_Y = 480;
	var BALL_X = 20;
	var BALL_Y = 20;
	var OB_X = 100;
	var OB_Y = 70;
	
	//Playing surface
	var canvasColor = "#000000";
	var cursorColor = "#0000FF";
	var ctx;
	
	//Setup the ball
	var wrencher = new Image();			
	wrencher.src = "jolly-wrencher.png";

	//Ball locations
	var skullX = 5;
	var skullY = 400;

	//How fast the ball is moving
	var speedX = 2;
	var speedY = -2;

	//Obstacles
	var ard = new Image();
		// image source:
		// http://commons.wikimedia.org/wiki/File:Arduino_Diecimila.jpg
	ard.src = "arduinoDiecimila.png"
	var obstacles = new Array();
	obstacles[0] = new arduinoOutBrick(5,75);
	obstacles[1] = new arduinoOutBrick(110,75);
	obstacles[2] = new arduinoOutBrick(215,75);
	obstacles[3] = new arduinoOutBrick(320,75);
	obstacles[4] = new arduinoOutBrick(425,75);
	obstacles[5] = new arduinoOutBrick(530,75);
	obstacles[6] = new arduinoOutBrick(5,150);
	obstacles[7] = new arduinoOutBrick(110,150);
	obstacles[8] = new arduinoOutBrick(215,150);
	obstacles[9] = new arduinoOutBrick(320,150);
	obstacles[10] = new arduinoOutBrick(425,150);
	obstacles[11] = new arduinoOutBrick(530,150);
	obstacles[12] = new arduinoOutBrick(5,225);
	obstacles[13] = new arduinoOutBrick(110,225);
	obstacles[14] = new arduinoOutBrick(215,225);
	obstacles[15] = new arduinoOutBrick(320,225);
	obstacles[16] = new arduinoOutBrick(425,225);
	obstacles[17] = new arduinoOutBrick(530,225);
	

	bod.e = document;

	if (bod.e.addEventListener) {
		bod.e.addEventListener("mousewheel", MouseWheelHandler, false);
		bod.e.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
	}
	else bod.e.attachEvent("onmousewheel", MouseWheelHandler);

	function MouseWheelHandler(e) {
		bgc = bgc + 0x111111;
		if (bgc == 0x111111) { 
			//document.body.style.backgroundImage="url('http://i.imgur.com/PLEMDG5.jpg')";
			arduinoOutInit();
		}
		else { document.body.style.background = "#" + ("000000" + bgc.toString(16,6)).slice(-6); }
		
		//console.log("#" + ("000000" + bgc.toString(16,6)).slice(-6));
		return false;
	}

	function arduinoOutInit()
	{
		var gameboard = document.createElement('canvas');
		document.body.appendChild(gameboard);
		gameboard.id = "hack";
		gameboard.width = GAME_X;
		gameboard.height = GAME_Y;
		var c = document.getElementById("hack");
		c.style.background = canvasColor;
		c.style.align="center";
		ctx = c.getContext("2d");



		//Setup the obstacles
		ctx.fillStyle=cursorColor;
		for (var i=0; i<obstacles.length; i++)
		{
			//ctx.fillRect(obstacles[i].x,obstacles[i].y,OB_X,OB_Y);
			ctx.drawImage(ard,obstacles[i].x,obstacles[i].y,OB_X,OB_Y);
		}

		//Start the game running
		setInterval(arduinoOutGame,10); //Start the game
	}

	function arduinoOutGame()
	{
		ctx.clearRect(skullX,skullY,BALL_X,BALL_Y);

		//Switch directions?
		arduinoOutCollision();

		skullX += speedX;
		skullY += speedY;

		//ctx.fillStyle=cursorColor;		
		//ctx.fillRect(skullX,skullY,BALL_X,BALL_Y);
		ctx.drawImage(wrencher,skullX,skullY,BALL_X,BALL_Y);

		
	}

	function arduinoOutCollision()
	{
		var collisionFlagX = false;
		var collisionFlagY = false;

		//Check boundaries
		if ((skullX+BALL_X >= GAME_X) || (skullX<=0)) { collisionFlagX = true; }
		if ((skullY+BALL_Y >= GAME_Y) || (skullY<=0)) {  collisionFlagY = true; }

		//Check obstacles
		for (var i=0; i<obstacles.length; i++)
		{
			if (obstacles[i].visible) {
				if (((obstacles[i].y <= skullY && skullY <= obstacles[i].y+OB_Y) || (obstacles[i].y <= skullY+BALL_Y && skullY+BALL_Y <= obstacles[i].y+OB_Y))
					&&
					((obstacles[i].x <= skullX && skullX <= obstacles[i].x+OB_X) || (obstacles[i].x <= skullX+BALL_X && skullX+BALL_X <= obstacles[i].x+OB_X)))
/*
				   ((obstacles[i].x <= skullX <= obstacles[i].x+OB_X)
					||	
				    (obstacles[i].x <= skullX+BALL_X <= obstacles[i].x+OB_X))
					&&
				   ((obstacles[i].y <= skullY <= obstacles[i].y+OB_Y)
					||
				    (obstacles[i].y <= skullY+BALL_Y <= obstacles[i].y+OB_Y))
					)
*/
				{
				console.log("Collision, %d %d %d %d",obstacles[i].x, obstacles[i].y, skullX, skullY);
				if (speedX < 0)	//Hit left side of obstacle?
				{ }
				if (speedX > 0) //Hit right side of obstacle?
				{ }
				if (speedY < 0) //Hit bottom of obstacle?
				{ 
							obstacles[i].visible = false;
							ctx.clearRect(obstacles[i].x,obstacles[i].y,OB_X,OB_Y);
							collisionFlagY = true;

				}
				if (speedY > 0) //Hit top of obstacle?
				{ }
}
			}
		}

		//Bounce if there was a collision
		if (collisionFlagX) { speedX = -speedX; } //FIXME speed changes
		if (collisionFlagY) { speedY = -speedY; }//FIXME speed changes
	}

	function arduinoOutBrick(x,y)
	{
		this.x = x;
		this.y = y;
		this.visible = true;
	}
}
