var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    // 街机插件
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};
var player;
var platforms;
var stars;
var cursors;
var score = 0;
var scoreText;
var bombs;
var gameOver = false;

var game = new Phaser.Game(config);
// 加载
function preload() {
    this.load.image("sky", "/assets/sky.png");
    this.load.image("ground", "/assets/platform.png");
    this.load.image("star", "/assets/star.png");
    this.load.image("bomb", "/assets/bomb.png");
    this.load.spritesheet("dude", "/assets/dude.png", {
        frameWidth: 32,
        frameHeight: 48,
    });
}

// 碰撞后的处理函数
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText("Score: " + score);
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x =
            player.x < 400
                ? Phaser.Math.Between(400, 800)
                : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

// 炸弹接触玩家的处理函数
function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;
}

// 创建
function create() {
    this.add.image(400, 300, "sky");
    // 创建一个新的静态物理组，不能设置速度
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(750, 220, "ground");

    scoreText = this.add.text(16, 16, "score: 0", {
        fontSize: "32px",
        fill: "#000",
    });

    // 创建精灵
    player = this.physics.add.sprite(100, 450, "dude");
    // 轻微的弹跳值 在落地后
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // 精灵0到3帧为向左奔跑 repeat循环播放 frameRate每秒10帧
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });

    // 面向相机
    this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
    });

    // 精灵4到8帧为向右奔跑
    this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });
    // 重力，值越高 物体感觉越重 下落越快
    // player.body.setGravityY(50);

    // 内置的键盘管理器
    cursors = this.input.keyboard.createCursorKeys();

    // 加入星尘
    // 将键设置为星图形，重复11次，意味着创建11个子项，代表总共有12项，每个子项从 x: 12、y: 0 x 步长为 70
    // 这意味着第一个子项将位于 12 x 0，第二个子项位于 82 x 0 处，比 70 像素远，第三个子项位于 152 x 0，依此类推
    stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
    });

    // 迭代group中的所有子节点 并赋予它们一个介于 0.4 和 0.8 之间的随机 Y 反弹值。反弹范围介于 0（完全不反弹）和 1（完全反弹）之间
    // 由于星星都是在 y 0 处生成的，重力会将它们拉下，直到它们与平台或地面相撞。反弹值意味着它们会随机地再次反弹，直到最终稳定下来。
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // 加入炸弹
    bombs = this.physics.add.group();

    // 监视两个物理对象的碰撞并使他们分离
    this.physics.addCollider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    // 检查玩家是否与星星重叠;
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play("left", true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play("right", true);
        // 初始cursors没有按左右，被设置成正面
    } else {
        player.setVelocityX(0);

        player.anims.play("turn");
    }
    // 按向上键并接触地板
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

