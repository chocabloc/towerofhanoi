var ctx;
var width, height;
var pegWidth = 8;
var diskHeight = 30;
var stage;

function movePegs(pegs, from, to, num, moves) {
    if (num == 0)
        return;
    s
    var tmpeg = 2 * pegs - 3 - from - to;
    movePegs(pegs, from, tmpeg, num - 1, moves);
    moves.push([ from, to ]);
    movePegs(pegs, tmpeg, to, num - 1, moves);
}

function getSolution(pegs, disks) {
    var moves = new Array(0);

    var reservePegs = Math.min(pegs - 3, disks - 1);
    for (var i = 1; i <= reservePegs; i++)
        moves.push([0, i]);
    movePegs(pegs, 0, pegs - 1, disks - reservePegs, moves)
    for (var i = reservePegs; i >= 1; i--)
        moves.push([i, pegs - 1]);

    for (var i = 0; i < moves.length; i++)
        console.log(moves[i][0] + "->" + moves[i][1]);
    return moves;
}

function drawStage(s) {
    if (s.won) {
        ctx.font = '48px sans';
        ctx.fillText("You Won", width / 2 - 100, 80);
    }

    var space = width / (s.pegs + 1);

    for (var i = 0; i < s.pegs; i++) {
        var pc = space * (i + 1);
        ctx.beginPath();
        ctx.rect(pc - (pegWidth / 2), height - 350, pegWidth, 330);
        ctx.fill();
        ctx.closePath();

        for (var j = 0; j < s.data[i].length; j++){
            var diskwidth = ((space - 15) / s.disks) * s.data[i][j];
            ctx.beginPath();
            ctx.rect(pc - (diskwidth / 2), height - 20 - diskHeight * (j + 1), diskwidth, diskHeight);
            if (s.selected && s.sp == i && s.sd == j) {
                ctx.stroke();
            } else {
                ctx.fill();
            }
            ctx.closePath();
        }
    }
}

function init() {
    stage = { data: new Array(3), pegs: 3, disks: 3, selected: false, sp: 0, sd: 0, won: false };
    for (var i = 0; i < stage.pegs; i++)
        stage.data[i] = new Array(0);
    for (var i = stage.disks; i >= 1; i--)
        stage.data[0].push(i);
    
    cnv = document.getElementById("cnv");
    width = cnv.width = document.body.clientWidth;
    height = cnv.height = document.body.clientHeight;
    ctx = cnv.getContext("2d");

    cnv.addEventListener('click', function (event) {
        if (stage.won)
            return;
        
        var x = event.pageX, y = event.pageY;
        
        var space = width / (stage.pegs + 1);
        var peg = Math.floor((x - (space / 2)) / space);
        if (peg < 0 || peg >= stage.pegs)
            return;
        
        var disks = stage.data[peg].length;
        var disk = disks - Math.floor((y - (height - 20 - diskHeight * disks)) / diskHeight) - 1;
        
        // below first disk
        if (disk < disks - 1) {
            stage.selected = false;
            return;
        }
        
        // above first disk
        if (disk >= disks) {
            if (stage.selected) {
                if (disks == 0 || stage.data[stage.sp][stage.sd] < stage.data[peg][disks - 1]) {
                    stage.data[peg].push(stage.data[stage.sp][stage.sd]);
                    stage.data[stage.sp].pop();
                    stage.selected = false;
                }
            }
        }
        // first disk
        else {
            stage.selected = true;
            stage.sp = peg;
            stage.sd = disk;
        }

        // check if won
        if (stage.data[stage.pegs - 1].length == stage.disks)
            stage.won = true;
        
        ctx.clearRect(0, 0, width, height);
        drawStage(stage);
    });

    drawStage(stage);
}
