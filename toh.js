var ctx;
var width, height;
var pegWidth = 8;
var diskHeight = 30;
var stage, stageOriginal;

function movePegs(pegs, from, to, num, moves) {
    if (num == 0)
        return;
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
    return moves;
}

function drawStage(s) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";

    if (s.autosolve) {
        ctx.font = '40px sans';
        if (s.won)
            ctx.fillText("Done", width/2 - 30, 100);
        else
            ctx.fillText("Auto-solving...", width/2 - 100, 100);
    } else if (s.won) {
        ctx.font = '48px sans';
        ctx.fillText("You Won", width / 2 - 100, 100);
    }

    ctx.font = '22px sans';
    ctx.fillText("Moves Taken: " + s.moves, 30, 35);

    var space = width / (s.pegs + 1);

    for (var i = 0; i < s.pegs; i++) {
        var pc = space * (i + 1);
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.rect(pc - (pegWidth / 2), height - 350, pegWidth, 330);
        ctx.fill();
        ctx.closePath();

        for (var j = 0; j < s.data[i].length; j++){
            var diskwidth = ((space - 15) / s.disks) * s.data[i][j];
            ctx.beginPath();
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = s.colors[s.data[i][j] - 1];
            ctx.rect(pc - (diskwidth / 2), height - 20 - diskHeight * (j + 1), diskwidth, diskHeight);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            if (s.selected && s.sp == i && s.sd == j)
                ctx.fillStyle = ctx.createPattern(document.getElementById("txt"), "repeat");
            ctx.rect(pc - (diskwidth / 2), height - 20 - diskHeight * (j + 1), diskwidth, diskHeight);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    }
}

function init() {
    var npegs = parseInt(prompt("Enter number of Pegs (3-6):"));
    while (isNaN(npegs) || npegs < 3 || npegs > 6)
        npegs = parseInt(prompt("Invalid Input. Enter number of Pegs (3-6):"));

    var ndisks = parseInt(prompt("Enter number of Disks (1-6):"));
    while (isNaN(ndisks) || ndisks < 1 || ndisks > 6)
        ndisks = parseInt(prompt("Invalid Input. Enter number of Disks (1-6):"));

    stage = { data: new Array(npegs), pegs: npegs, disks: ndisks, selected: false, sp: 0, sd: 0, won: false, moves: 0,
              autosolve: false, colors: new Array(0) };
    for (var i = 0; i < stage.pegs; i++)
        stage.data[i] = new Array(0);
    for (var i = stage.disks; i >= 1; i--)
        stage.data[0].push(i);
    for (var i = 0; i < ndisks; i++) {
        var r = Math.floor(200 + Math.random() * 56),
            g = Math.floor(200 + Math.random() * 56),
            b = Math.floor(200 + Math.random() * 56);
        stage.colors.push("rgb(" + r + ", " + g + ", " + b + ")");
        console.log(stage.colors[i]);
    }
    
    stageOriginal = JSON.parse(JSON.stringify(stage));
    cnv = document.getElementById("cnv");
    width = cnv.width = document.body.clientWidth;
    height = cnv.height = document.body.clientHeight;
    ctx = cnv.getContext("2d");

    cnv.addEventListener('click', function (event) {
        if (stage.won || stage.autosolve)
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
                    stage.moves++;
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
        
        drawStage(stage);
    });

    drawStage(stage);
}

function reset() {
    stage = JSON.parse(JSON.stringify(stageOriginal));
    console.log(JSON.stringify(stageOriginal));
    drawStage(stage);
}

function newgame() {
    location.reload();
}

function autosolve_step(moves, i) {
    if (!stage.autosolve)
        return;

    console.log(moves[i][0] + "->" + moves[i][1]);
    stage.data[moves[i][1]].push(stage.data[moves[i][0]].pop());
    stage.moves++;
    drawStage(stage);

    if (i + 1 == moves.length) {
        stage.won = true;
        drawStage(stage);
        return;
    }
    setTimeout(function() {
        autosolve_step(moves, i + 1)
    }, 1000);
}

function autosolve() {
    reset();
    stage.autosolve = true;
    drawStage(stage);

    moves = getSolution(stage.pegs, stage.disks);
    autosolve_step(moves, 0);
}
