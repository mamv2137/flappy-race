'use client'

import React, { useState, useRef, useEffect } from "react";

import './Flappy.css';

const statesGame = Object.freeze({
  SplashScreen: 0,
  GameScreen: 1,
  ScoreScreen: 2,
});

const defaultSettings = {
  gravity: 0.25,
  velocity: 0,
  position: 180,
  rotation: 0,
  jump: -4.6,
  score: 0,
  highscore: 0,
  pipeheight: 90,
  pipewidth: 52,
  pipes: [],
}

const FlappyBirdGame = () => {
  const [gameState, setGameState] = useState(statesGame.SplashScreen);
  const [settings, setSettings] = useState(defaultSettings);

  let gravity = 0.25;
  let velocity = 0;
  let position = 180;
  let rotation = 0;
  let jump = -4.6;
  let flyArea = useRef(null);

  let score = 0;
  let highscore = 0;

  let pipeheight = 90;
  let pipewidth = 52;
  let pipes = new Array();

  //loops
  let loopGameloop;
  let loopPipeloop;


  function playerDead() {
    //stop animating everything!
    var animatedElements = document.querySelectorAll(".animated");
    for (var i = 0; i < animatedElements.length; i++) {
      animatedElements[i].style.animationPlayState = "paused";
      animatedElements[i].style.webkitAnimationPlayState = "paused";
    }

    //drop the bird to the floor
    var player = document.getElementById("player");
    var playerBottom = player.getBoundingClientRect().top + player.offsetWidth; //we use offsetWidth because he'll be rotated 90 deg
    var floor = flyArea;
    var movey = Math.max(0, floor - playerBottom);
    player.style.transform = "translateY(" + movey + "px) rotate(90deg)";

    //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
    setGameState(statesGame.ScoreScreen);

    //destroy our gameloops
    clearInterval(loopGameloop);
    clearInterval(loopPipeloop);
    loopGameloop = null;
    loopPipeloop = null;

    // //mobile browsers don't support buzz bindOnce event
    // if (isIncompatible.any()) {
    //   //skip right to showing score
    //   showScore();
    // } else {
    //   //play the hit sound (then the dead sound) and then show score
    //   // soundHit.play();
    //   // soundHit.addEventListener("ended", function () {
    //   //   soundDie.play();
    //   //   soundDie.addEventListener("ended", function () {
    //   //     showScore();
    //   //   });
    //   // });
    // }
  }

  function updatePlayer(player) {
    // rotation
    let rotation = Math.min((velocity / 10) * 90, 90);

    // apply rotation and position
    player.style.transform = `rotate(${rotation}deg)`;
    player.style.top = position + "px";
  }

  function gameloop() {
    var player = document.querySelector("#player");

    // Update the player speed/position
    velocity += gravity;
    position += velocity;

    // // Update the player
    updatePlayer(player);

    // Create the bounding box
    var box = player.getBoundingClientRect();
    var origwidth = 34.0;
    var origheight = 24.0;

    var boxwidth = origwidth - Math.sin(Math.abs(rotation) / 90) * 8;
    var boxheight = (origheight + box.height) / 2;
    var boxleft = (box.width - boxwidth) / 2 + box.left;
    var boxtop = (box.height - boxheight) / 2 + box.top;
    var boxright = boxleft + boxwidth;
    var boxbottom = boxtop + boxheight;

    // // Did we hit the ground?
    // if (box.bottom >= document.querySelector("#land").offsetTop) {
    //   playerDead();
    //   return;
    // }

    // // Have they tried to escape through the ceiling? :o
    // var ceiling = document.querySelector("#ceiling");
    // if (boxtop <= ceiling.offsetTop + ceiling.offsetHeight) position = 0;

    // // We can't go any further without a pipe
    // if (pipes[0] == null) return;

    // // Determine the bounding box of the next pipe's inner area
    // var nextpipe = pipes[0];
    // var nextpipeupper = nextpipe.querySelector(".pipe_upper");

    // var pipetop = nextpipeupper.offsetTop + nextpipeupper.offsetHeight;
    // var pipeleft = nextpipeupper.offsetLeft - 2; // For some reason, it starts at the inner pipe's offset, not the outer pipe's.
    // var piperight = pipeleft + pipewidth;
    // var pipebottom = pipetop + pipeheight;

    // // Have we gotten inside the pipe yet?
    // if (boxright > pipeleft) {
    //   // We're within the pipe, have we passed between upper and lower pipes?
    //   if (boxtop > pipetop && boxbottom < pipebottom) {
    //     // Yeah! We're within bounds
    //   } else {
    //     // No! We touched the pipe
    //     playerDead();
    //     return;
    //   }
    // }

    // // Have we passed the imminent danger?
    // if (boxleft > piperight) {
    //   // Yes, remove it
    //   pipes.splice(0, 1);

    //   // And score a point
    //   playerScore();
    // }
  }

  function playerJump() {
    velocity = jump;
    //play jump sound
    // soundJump.stop();
    // soundJump.play();
  }

  function showSplash() {
    setGameState(statesGame.SplashScreen);

    //set the defaults (again)
    velocity = 0;
    position = 180;
    rotation = 0;
    score = 0;

    document.querySelector("#player").style.y = 0;

    document.querySelector("#player").style.x = 0;

    updatePlayer(document.querySelector("#player"));

    // soundSwoosh.stop();

    // soundSwoosh.play();

    //clear out all the pipes if there are any

    const pipeElements = document.querySelectorAll(".pipe");

    pipeElements.forEach(function (pipeElement) {
      pipeElement.remove();
    });

    pipes = [];

    //make everything animated again

    const animatedElements = document.querySelectorAll(".animated");

    animatedElements.forEach(function (animatedElement) {
      animatedElement.style.animationPlayState = "running";
      animatedElement.style.webkitAnimationPlayState = "running";
    });

    //fade in the splash

    const splashElement = document.querySelector("#splash");

    splashElement.style.opacity = 0;

    splashElement.style.transition = "opacity 2000ms ease";

    splashElement.style.opacity = 1;
  }

  function updatePipes() {
    // Do any pipes need removal?
    var pipeElements = document.querySelectorAll(".pipe");
    pipeElements.forEach(function (pipe) {
      if (pipe.offsetLeft <= -100) {
        pipe.remove();
      }
    });

    // Add a new pipe (top height + bottom height + pipeheight == flyArea) and put it in our tracker
    var padding = 80;
    var constraint = flyArea - pipeheight - padding * 2; // double padding (for top and bottom)
    var topheight = Math.floor(Math.random() * constraint + padding); // add lower padding
    var bottomheight = flyArea - pipeheight - topheight;
    var newpipe = document.createElement("div");
    newpipe.className = "pipe animated";
    newpipe.innerHTML =
      '<div class="pipe_upper" style="height: ' +
      topheight +
      'px;"></div><div class="pipe_lower" style="height: ' +
      bottomheight +
      'px;"></div>';
    document.getElementById("flyarea").appendChild(newpipe);
    pipes.push(newpipe);
  }

  function startGame() {
     setGameState(statesGame.GameScreen);

    // remove splash screen
    const splash = document.getElementById("splash");
    splash.style.opacity = 0;
    splash.style.transition = "opacity 2000ms ease";

    //start up our loops
    var updaterate = 1000.0 / 60.0; //60 times a second
    loopGameloop = setInterval(gameloop, updaterate);
    // loopPipeloop = setInterval(updatePipes, 1400);

    //jump from the start!
    playerJump();
  }

  function screenClick() {
    if (gameState === statesGame.GameScreen) {
      playerJump();
    } else if (gameState === statesGame.SplashScreen) {
      startGame();
    }
  }

  useEffect(() => {
    if (flyArea.current) {
      flyArea.current.addEventListener("click", screenClick);
      showSplash();
    }
  }, []);

 


  return (
    <div id="gamecontainer">
      <div id="gamescreen">
        <div id="sky" className="animated">
          <div id="flyarea" ref={flyArea}>
            <div id="ceiling" className="animated"></div>
            {/* <!-- This is the flying and pipe area container --> */}
            <div id="player" className="bird animated"></div>

            <div id="bigscore"></div>

            <div id="splash"></div>

            <div id="scoreboard">
              <div id="medal"></div>
              <div id="currentscore"></div>
              <div id="highscore"></div>
              <div id="replay">
                <img src="assets/replay.png" alt="replay" />
              </div>
            </div>

            <div
              class="pipe_upper"
            />
            <div
              class="pipe_lower"
            />
          </div>
        </div>
        <div id="land" className="animated">
          {/* <div id="debug"></div> */}
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;
