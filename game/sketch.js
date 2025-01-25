/**
 * Duck Harm, con controlli gestuali
 *
 * Autori: Filippo Zinetti, Isaac Gragasin
 * Data: 27.6.2019
 * Link al gioco: https://editor.p5js.org/Filippo_Z/full/Dlo34ln7Z
 */


//---------------------- GIOCO ----------------------

let running = true;
let frame;
let fps;
let menu;
let world;
let hud;

let crosshairImg;
let duckLeftImgs;
let duckRightImgs;
let duckDeadImg;
let frameImg;
let shotImg;
let bushImg;
let treeImg;
let grassImg;

let t;

function setup() {
  let c = createCanvas(650, 500);
  setupCalibration();
  //setupGame();
}

//Inizializza il gioco
function setupGame() {
  imageMode(CENTER);
  calibrationOver = true;
  noCursor();
  loadGame();
  t = millis();
  run();
}

function draw() {
  drawCalibration();
}
let f = 0;
//Loop di gioco
function run() {
  running = true;
  if (millis() - t >= 1000 / fps -17) {
    t = millis();
    tick();
    render();
  }
  
  if (running) {
    setTimeout(run, 0);
  }
}

//Aggiorna le proprietà degli oggetti
function tick() {
  world.tick();
}

//Disegna gli oggetti
function render() {
  background("#00ccff");
  world.render();
  hud.render();
}

//Carica le immagini e crea inizializza la partita
function loadGame() {
  //scale(1.0,1.0); 
  //img = loadImage("Smallfry.png");
  //image(img, 10,10);
  fps = 60;
  frame = 0;
  hud = new HUD(130);
  world = new World();
  world.addItem(new Item(20,world.gameH / 4, treeImg, 160, 256));
  world.addItem(new Item(width * 2 / 3,world.gameH - 120, bushImg, 68, 74));
  world.addItem(new Item(0,world.gameH-70, grassImg, width, world.gameH-70 * 0.6375));

  world.duck = new Duck();
  let rawSeconds = (world.hitsPerRound + 1) * world.duck.lifeSeconds;
  world.timer = floor(rawSeconds / 10) * 10 + 20;
}

//Carica tutte le immagini
function loadImages() {
  titleImg = loadImage("Title.png");
  crosshairImg = loadImage("Crosshair.png");
  duckDeadImg = loadImage("DeadDuck.png"),
  duckLeftImgs = [ loadImage("LeftDuck.png"), loadImage("LeftDuck2.png") ];
  duckRightImgs = [ loadImage("RightDuck2.png"), loadImage("RightDuck2.png") ];
  frameImg = loadImage("frame.png");
  shotImg = loadImage("Shot.png");
  bushImg = loadImage("Bush.png");
  treeImg = loadImage("Tree.png");
  grassImg = loadImage("Grass.png");
}

//La schermata di gioco con tutti gli oggetti al suo interno
class World {
  constructor() {
    this.gameW = width;
    this.gameH = height - hud.h;
    this.grassH = 70;
    
    this.round = 1;
    this.shot = 3;
    this.hitsPerRound = 3;
    this.hit = 0;
    this.score = 0;
    
    this.items = [];
    this.duck = "";
    this.crosshair = new Crosshair();
    
    this.timer = 0;
  }
  
  tick() {
    if (this.timer == 0) {
      return;
    }
    this.duck.tick();
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].tick();
    }
    this.crosshair.tick();
    frame++;
    this.tickTimer();
  }
  
  tickTimer() {
    if (frame % 60 == 0) {
      this.timer--;
      if (this.timer == 0) {
        setTimeout(loadGame, 2000);
        return;
      }
    }
  }
  
  duckIsDead() {
    this.crosshair.canShoot = false;
    if (this.duck.aliveFrames > this.duck.lifeSeconds * fps) {
      this.duck.aliveFrames = this.duck.lifeSeconds * fps;
    }
    let mult = map(this.duck.aliveFrames, this.duck.lifeSeconds * fps, 0, 0.1, 10);
    let currentScore = floor(parseInt(100 * mult) / 10) * 10 + 250;
    if (currentScore > 1000) {
      currentScore = 1000;
    }
    this.score += currentScore;
    this.hit++;
    this.shot = 3;
    let resetTimer = false;
    if (this.hit == this.hitsPerRound) {
      this.round++;
      if (this.round >= 6) {
        print("HAI VINTO");
        running = false;
        setTimeout(setupGame, 2000);
        return;
      }
  world.addItem(new Item(random(20 * this.round, width),world.gameH / 4, treeImg, 160, 256));
      this.hit = 0;
      resetTimer = true;
    }
    this.duck = new Duck();
    
    if (resetTimer) {
      let rawSeconds = (this.hitsPerRound + 1) * this.duck.lifeSeconds;
      this.timer = floor(rawSeconds / 10) * 10 + 20;
    }
    
    running = false;
    setTimeout(run, 3000);
    this.crosshair.canShoot = true;
  }
  
  duckEscaped() {
    this.duck = new Duck();
  }
  
  render() {
    this.duck.render();
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].render();
    }
    this.crosshair.render();
  }
  
  addItem(item) {
    this.items.push(item);
  }
}

//Oggetto generico statico, usato per decorazione
class Item {
  constructor(x, y, img, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.img = img;
  }
  
  tick() {
  }
  
  render() {
    fill(0,255,0);
    imageMode(CORNER);
    image(this.img, this.pos.x, this.pos.y, this.w, this.h);
  }
}

//La papera da colpire
class Duck {
  constructor() {
    this.speedX = random(world.round+1, world.round+2) * random(-1, 1);
    this.speedY= world.round + 0.5;
    this.rad = 25;
    this.pos = createVector(random(this.rad, width-this.rad), world.gameH - this.rad);
    this.leftImgs = duckLeftImgs;
    this.rightImgs = duckRightImgs;
    this.imgs = duckLeftImgs;
    this.deadImg = duckDeadImg;
    this.aliveFrames = 0;
    this.lifeSeconds = 9 - world.round;
    this.animationFrame = 0;
    this.animationSpeed = 500;
  }
  
  tick() {
    if (this.dead) {
      world.crosshair.canShoot = false;
      this.speedY += 0.2;
      this.speedX = 0;
      if (this.pos.y > world.gameH) {
        world.duckIsDead();
        return;
      }
    } else {
      //Margini laterali
      if (random(1000) > 998 || this.pos.x < this.rad
          || this.pos.x > world.gameW - this.rad) {
        this.speedX *= -1;
      }
      //Margini superiore e inferiore
      if (random(1000) > 998 || this.pos.y < this.rad
          || this.pos.y > world.gameH - this.rad) {
        this.speedY *= -1;
      }
      //La papera va verso l'alto se ha finito i secondi di vita o se sta uscendo dall'erba
      if (this.aliveFrames >= this.lifeSeconds * fps || this.pos.y + this.rad > world.gameH - world.grassH) {
        this.speedY = -abs(this.speedY);
        if (this.pos.y + this.rad < 0) {
        if (this.pos.y + this.rad < this.speedY * 3 * fps) {
          world.duckEscaped();
          return;
        }
        }
      }
      if (this.speedX > 0) {
        this.imgs = duckRightImgs;
      } else {
        this.imgs = duckLeftImgs;
      }
    }
    this.pos.x += this.speedX;
    this.pos.y += this.speedY;
    if (frame % (this.animationSpeed/1000 * fps) == 0) {
      this.animationFrame++;
    }
    this.aliveFrames++;
  }
  
  render() {
    this.animationFrame %= this.imgs.length;
    fill("#009999");
    imageMode(CENTER);
    if (this.dead) {
      image(this.deadImg, this.pos.x, this.pos.y, this.rad * 2, this.rad * 2);
    } else {
      image(this.imgs[this.animationFrame], this.pos.x, this.pos.y, this.rad * 2, this.rad * 2);
    }
  }
}

//Il puntatore del giocatore usato per mirare
class Crosshair {
  constructor() {
    this.pos = createVector(width / 2, height * 2 / 3);
    this.rad = 15;
    this.img = crosshairImg;
    this.shoot = false;
    this.reload = false;
    this.realodFrame = 0;
    this.reloadTimer = 1;
    this.canShoot = true;
    this.xSum = 0;
    this.ySum = 0;
    this.avgNum = 3;
  }
  
  tick() {
    if (!this.canShoot) {
      return;
    }
    //sliderX.value(random(0.3,0.7));
    //sliderY.value(random(0.3,0.7));
    let rawX = 1 - floor(sliderX.value()*100) / 100;
    handX = map(rawX, 0.25, 0.85, 0, width);
    let rawY = floor(sliderY.value()*100) / 100;
    handY = map(rawY, 0.15, 0.85, 0, world.gameH);
    if (handX > width) {
      handX = width;
    } else if (handX < 0) {
      handX = 0;
    }
    if (handY > world.gameH) {
      handY = world.gameH;
    } else if (handY < 0) {
      handY = 0;
    }
    this.xSum += handX;
    this.ySum += handY;
    if (frame % this.avgNum == 0) {
      this.updatePosition(this.xSum / this.avgNum, this.ySum / this.avgNum);
      //this.updatePosition(mouseX, mouseY);
      this.xSum = 0;
      this.ySum = 0;
    }
    if (this.pos.y > world.gameH) {
      this.pos.y = world.gameH;
    }
    if (mouseIsPressed && !this.shoot && !this.reload) {
      this.fire();
      this.shoot = true;
    }
    if (!mouseIsPressed && this.shoot) {
      this.shoot = false;
    }
    if (keyIsPressed && !this.reload) {
      this.reloadFrame = frame;
      this.reload = true;
    }
    if (this.reload && frame - this.reloadFrame > this.reloadTimer * fps) {
      this.reload = false;
      world.shot = 3;
    }
  }
  
  updatePosition(x, y) {
    this.pos = createVector(x, y);
  }
  
  fire() {
    if (world.shot == 0) {
        return;
    }
    world.shot--;
    if (dist(this.pos.x, this.pos.y, world.duck.pos.x, world.duck.pos.y) < this.rad + world.duck.rad) {
      world.duck.dead = true;
    }
  }
  
  render() {
    if (!this.canShoot) {
      return;
    }
    fill(255, 0, 0);
    imageMode(CENTER);
    if (world.shot > 0) {
      image(this.img, this.pos.x, this.pos.y, this.rad * 3, this.rad * 3);
    } else {
      image(this.img, this.pos.x, this.pos.y, this.rad, this.rad);
    }
  }
}

//Informazioni sulla partita
class HUD {
  constructor(h) {
    this.y = height - h;
    this.h = h;
    this.w = width;
    this.shotHUD = new ShotHUD(30, this.y + 60, 70, 50);
    this.hitHUD = new HitHUD(140, this.y + 60, width / 2.2, 50);
    this.scoreHUD = new ScoreHUD(width - width / 3 + 40, this.y + 60, width / 5, 50);
    this.timerHUD = new TimerHUD(205, this.y + 10, width / 4, 40);
  }
  
  tick() {
  }
  
  render() {
    textSize(15);
    textAlign(CENTER, CENTER);
    imageMode(CORNER);
    image(frameImg, 30-2, this.y + 20-2, 70+4, 20+4);
    fill(255);
    text("Round = " + world.round, 30 + 35, this.y + 30);
    
    this.shotHUD.render();
    this.hitHUD.render();
    this.scoreHUD.render();
    this.timerHUD.render();
  }
}

//Interfaccia dei proiettili rimanenti
class ShotHUD {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
  }
  
  render() {
    push();
    fill(0);
    image(frameImg, this.pos.x-2, this.pos.y-2, this.w+4, this.h+4);
    
    fill(255);
    textSize(this.h / 2);
    textAlign(LEFT, TOP);
    imageMode(CORNER);
    for (let i = 0; i < world.shot; i++) {
      image(shotImg, this.pos.x + 11 + i * this.w / 4, this.pos.y + 1, 12, 21);
    }
    textAlign(CENTER, BOTTOM);
    text("SHOT", this.pos.x + this.w / 2, this.pos.y + this.h);
    pop();
  }
}

//Interfaccia delle papere colpite
class HitHUD {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.value = "O";
  }
  
  render() {
    push();
    fill(0);
    image(frameImg, this.pos.x-2, this.pos.y-2, this.w+4, this.h+4);
    
    fill(255);
    textSize(this.h / 2);
    textAlign(RIGHT, TOP);
    this.value = "";
    for (let i = 0; i < world.hitsPerRound; i++) {
      if (i < world.hit) {
        this.value += "X";
      } else {
        this.value += "O";
      }
    }
    text(this.value, this.pos.x + this.w - 7, this.pos.y+5);
    textAlign(LEFT, TOP);
    text("HIT", this.pos.x+7, this.pos.y+5);
    pop();
  }
}

//Interfaccia dei punti guadagnati
class ScoreHUD {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.value = "000000";
  }
  
  render() {
    push();
    fill(0);
    image(frameImg, this.pos.x-2, this.pos.y-2, this.w+4, this.h+4);
    
    fill(255);
    textSize(this.h / 2);
    textAlign(CENTER, TOP);
    this.value = world.score;
    let score = "";
    for(let i = 0; i < 6 - (""+this.value).length; i++) {
      score += "0";
    }
    score += this.value;
    text(score, this.pos.x + this.w / 2, this.pos.y + 2);
    textAlign(RIGHT, BOTTOM);
    text("SCORE", this.pos.x + this.w - 5, this.pos.y + this.h);
    pop();
  }
}

//Interfaccia del timer di gioco
class TimerHUD {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.value = 0;
  }
  
  render() {
    push();
    fill(0);
    image(frameImg, this.pos.x-2, this.pos.y-2, this.w+4, this.h+4);
    
    fill(255);
    textSize(this.h / 1.5);
    textAlign(RIGHT, CENTER);
    //this.value = floor(world.timer / 60) + ":" + world.timer;
    this.value = world.timer;
    text(this.value, this.pos.x + this.w - 5, this.pos.y + this.h / 2);
    textAlign(LEFT, CENTER);
    text("TIMER", this.pos.x+5, this.pos.y + this.h / 2);
    pop();
  }
}


//---------------------- CALIBRAZIONE ----------------------


let calibrationOver;
let mobileNetX;
let mobileNetY;
let flag = 0;
let showHelp = true;
let showTitle = true;
let showCalibration = false;
let regressorX;
let regressorY;
let img;
let video;
let sliderX;
let sliderY;
let calibButton1;
let startButton;
let trainFlag = 0;
let seq = 0;

let calibrationTimeout = 1000;
let times = 0;
let speed;
let inc = 0.10;
let sX = 0;
let sY = 0;

let handX;
let handY;


function setupCalibration() {
  calibrationOver = false;
  loadImages();
  mobileNetX=ml5.featureExtractor("MobileNet", modelReady);
  mobileNetY=ml5.featureExtractor("MobileNet", modelReady);
  
  video = createCapture(VIDEO);
  video.hide();
  
  regressorX=mobileNetX.regression(video, videoReady);
  regressorY=mobileNetY.regression(video, videoReady);
  
  
  sliderX=createSlider(0,1,0,0.01); 
  sliderX.hide();
  sliderY=createSlider(0,1,0,0.01);
  sliderY.hide();
  
  
  calibButton1=createButton("Calibration");
  calibButton1.size(width/4, height/8);
  calibButton1.position(width/2.7, height/2.7);
    calibButton1.hide();
  calibButton1.mousePressed(function(){
    showHelp = false;
    sliderX.value(0);
    sliderY.value(0);
    speed = createVector(inc, 0);
    setTimeout(captureFrames, 800);
    calibButton1.hide();
    showCalibration = false;
  });
  startButton=createButton("Start game!");
  startButton.size(width/4, height/12);
  startButton.position(width/3, height/1.7);
  startButton.mousePressed(function() {
    showTitle = false;
    showCalibration = true;
  });
  //setTimeout(setupGame, 2000);
}
function captureFrames() {
  sX = sliderX.value();
  sY = sliderY.value();
  if (times % 2 == 0) {
    setTimeout(function() {regressorX.addImage(sliderX.value())}, 500);
  }
  if (times % 2 == 0) {
    setTimeout(function() {regressorY.addImage(sliderY.value())}, 500);
  }
  if (((sX < 1 && speed.x >= 0) || (sX > 0 && speed.x <= 0))
      && ((sY < 1 && speed.y >= 0) || (sY > 0 && speed.y <= 0))) {
    sliderX.value(sX+speed.x);
    sliderY.value(sY+speed.y);
    setTimeout(captureFrames, calibrationTimeout);
    times++;
  } else {
    seq++;
    if (seq == 1) {
      speed = createVector(0, inc);
    } else if (seq == 2) {
      speed = createVector(-inc, 0);
    } else if (seq == 3) {
      speed = createVector(0, -inc);
    } else {
      trainFlag = 0;
      return;
    }
    setTimeout(captureFrames, 500);
  }
  times++;
}

function drawCalibration() {
  if (calibrationOver) {
    return;
  }
  background(255);
  if (showTitle) {
    background("#00ccff");
    image(titleImg, width / 8, height / 10, width / 3 * 2, height / 5 * 2);
    return;
  }
  if (showCalibration) {
    calibButton1.show();
  }
  startButton.hide();
  image(video, 0, 0, width, height);
  fill(255);
  line(width/3, 0, width/3, height);
  line (2*(width/3), 0, 2*(width/3), height);
  line(0, height/3, width, height/3);
  line(0, 2*(height/3), width, 2*(height/3));
  drawHelp();
  fill(0);
  let rawX = floor(sliderX.value()*20) / 20;
  handX = map(rawX, 0, 1, 0, width);
  let rawY = floor(sliderY.value()*20) / 20;
  handY = map(rawY, 0, 1, 0, height);
  push();
  rectMode(CENTER);
  strokeWeight(5);
  stroke(255);
  fill(0);
  rect(handX, handY, 30, 30);
  pop();
  if(seq == 4 && trainFlag < 5){
    //Training
    push();
    imageMode(CENTER);
    image(frameImg, width / 2, height / 2, width / 2, height / 8);
    textAlign(CENTER);
    fill(255);
    text("Training in corso, attendere.\nMantenere la mano ferma in questo rettangolo.", width / 2, height / 2);
    pop();
    if (trainFlag == 0) {
      print("Inizio training. Attendere.");
      trainFlag++;
      regressorX.train(whileTraining);
    } else if (trainFlag == 2) {
      trainFlag++;
      regressorY.train(whileTraining);
    } else if (trainFlag == 4) {
      trainFlag++;
      //Run
      regressorX.predict(gotResultsX);
      regressorY.predict(gotResultsY);
      calibrationOver = true;
      setupGame();
    } else {
    }
  }
}

function drawHelp() {
  if (showHelp) {
    push();
    imageMode(CORNER);
    image(frameImg, 50, height - 230, width - 100, 220);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Per una calibrazione ottimale:\n- Posizionare la mano/il pungo nel riquadro del video in alto a sinistra\n- Seguire con la mano il rettangolo nero, ma senza uscire\ndall'area dellla videocamera\n- Il rettangolo percorrerà tutti gli angoli formando un quadrato.\nSeguirlo in tutti i passaggi senza anticipare la sua posizione,\nma reagendo velocemente al suo spostamento.\n- Usare uno sfondo senza troppe interferenze e cambiamenti\nnè durante la calibrazione,nè durante il gioco\n - Cliccare \"Calibration\" per cominciare\n- Alla fine della calibrazione mantenere la mano ferma nel rettangolo centrale,\nsenza spostarla nè in avanti nè indietro", 100 + (width - 200) / 2, height - 230 + 220 / 2);
    
    image(frameImg, 50, height / 10, width - 100, 100);
    text("LEGGERE ATTENTAMENTE PER UN'ESPERIENZA DI GIOCO OTTIMALE\nI comandi sono tre:\n- Muovere la mano per mirare\n- Cliccare un tasto del mouse per sparare\n- Cliccare un tasto della tastiera per ricaricare", 100 + (width - 200) / 2, height / 10 + height / 10);
    pop();
  }
}

function modelReady(){
  print("The model is ready");
}

function videoReady(){
  print("The video is ready");
}

function whileTraining(loss){
  //console.log(loss);
  if(loss == null){
    trainFlag++;
    print("Training " + ((trainingFlag+1)/2) + "/2 completato. Attendere.");
  }
}

function gotResultsX(error, results){
  if(error){
    print(error);
  }else{
    //print(results);
    outputValueX=results.value;
    sliderX.value(outputValueX);
  }
  regressorX.predict(gotResultsX);
}


function gotResultsY(error, results){
  if(error){
    print(error);
  }else{
    //print(results);
    outputValueY=results.value;
    sliderY.value(outputValueY);
  }
  regressorY.predict(gotResultsY);
}