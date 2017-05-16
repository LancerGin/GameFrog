// 这是我们的玩家要躲避的敌人
var Enemy = function(x,y,v) {
    // 设置敌人的 x坐标、 y坐标、移动速度;并记录初始启动的 X坐标位置
    this.x = x;
    this.start = x;
    this.y = y;
    this.speed = v;
    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    this.x += this.speed*dt;
    // 当敌人移动至屏幕外侧后，回到初始 X位置，并设置新的 Y坐标和移动速度
    if(this.x > 600){
        this.x = this.start;
        this.y = enemyAttr().y;
        this.speed = enemyAttr().speed;
    }
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function(x,y){
    // 设置玩家的初试坐标位置，设置游戏开始时的分数为 0
    this.x = x;
    this.y = y;
    this.count = 0;
    // 作为游戏胜利时的一个判断标识
    this.success = false;
    //玩家的图片
    this.sprite = 'images/char-boy.png';
};
Player.prototype.update = function(){
    //调用碰撞检测
    checkCollisions();
    /* 玩家移动到河里时 Y坐标的值为 -9
     * 这里使用了计时事件，因为直接调用 victory()会导致玩家抵达河里的动画无法
     * 展示就被复位到初试坐标。而 victory()被延迟调用的过程，engine.js会不断
     * 重绘，从而导致 update被不断调用，此时玩家的坐标没有改变，this.y === -9
     * 一直为 true，victory()就会被重复调用导致计数不正常，所以使用了一个额外
     * 的判断条件  this.success
     */
    if(this.y === -9 && !this.success){
        setTimeout(function(){victory();},500);
        this.success = true;
    }
};
//画出玩家
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// stop 用于是否禁止键盘事件的判断标识，当碰撞发生时游戏结束，会禁止键盘事件
// 重新开始游戏时恢复键盘事件
var stop = false;
Player.prototype.handleInput = function(position){
    if(!stop){
        if(position === 'up'&& this.y > 0){
            this.y -= 83;
        }else if(position === 'down'&& this.y < 400){
            this.y += 83;
        }else if(position === 'left'&& this.x > 0){
            this.x -= 101;
        }else if(position === 'right'&& this.x < 400){
            this.x += 101;
        }
    }
};


// 现在实例化所有对象
//定义一些常量,玩家和敌人的图标像素宽度，玩家起始位置
var   PIC_WIDTH = 101,
      PIC_HEIGHT = 83,
      PLAYER_START_X = 200,
      PLAYER_START_Y = 406;
// 实例化敌人对象时随机产生敌人的初始位置和移动速度
var enemyAttr = function(){
    var randomY = Math.ceil(Math.random()*3);
    var randomSpeed = Math.ceil(Math.random()*3);
    var y = randomY*PIC_HEIGHT - 25;
    var speed = randomSpeed*80;
    return {y:y,speed:speed};
};
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
var allEnemies = [];
// 敌人的 Y坐标和移动速度随机产生，X坐标以一定间距依次设置
// 敌人对象可以重复利用，所以当实例化 10个敌人后停止生产新的敌人
var enemyX = -120;
var produceEnemy = function(){
    var y = enemyAttr().y;
    var speed = enemyAttr().speed;
    var enemy = new Enemy(enemyX,y,speed);
    allEnemies.push(enemy);
};
while(enemyX>=-1200){
    produceEnemy();
    enemyX -= 120;
}


// 把玩家对象放进一个叫 player 的变量里面
var player = new Player(PLAYER_START_X,PLAYER_START_Y);

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// 碰撞检测。玩家和敌人在同一行时才可能发生碰撞，此时 y坐标相差 16
// X坐标差值小于了图标宽度 PIC_WIDTH 的时候，认为玩家和敌人碰撞了
var checkCollisions = function(main){
    for(var i=0;i<allEnemies.length;i++){
        var distanceX = Math.abs(player.x - allEnemies[i].x);
        var distanceY = Math.abs(player.y - allEnemies[i].y);
        if(distanceX < PIC_WIDTH && distanceY === 16){
            //游戏结束，向 result()传参 ‘on’ 以显示游戏结束的画面
            result('on');
            //游戏结束，禁止键盘事件
            stop = true;
        }
    }
};

//显示隐藏游戏结果画面
var result = function(action){
    var again = document.getElementById('again');
    again.setAttribute('class',action);
    var score = document.getElementById('score');
    score.innerHTML = player.count;
};

//获取页面上显示分数的元素
var count = document.getElementById('count');
//达到获胜条件时调用的函数
var victory = function(){
    // 获胜一次，玩家得分 +1，并在页面上显示，然后玩家复位继续挑战，
    // 并把胜利判断标识  player.success 恢复默认值
    player.count += 1;
    count.innerHTML = 'score:'+player.count;
    player.x = PLAYER_START_X;
    player.y = PLAYER_START_Y;
    player.success = false;
};
// 在游戏结果画面点击‘再玩一次’调用此函数重新开始游戏，分数归零
// 键盘事件恢复使用，玩家回到初始位置
var playAgain = function(){
  player.count = 0;
  count.innerHTML = 'score:0';
  stop = false;
  player.x = PLAYER_START_X;
  player.y = PLAYER_START_Y;
};
