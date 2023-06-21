const gameContainer = document.querySelector(".game-container");
gameContainer.style.width = `${Math.min(document.body.offsetWidth,document.body.offsetHeight)}px`;
gameContainer.style.height = `${Math.min(document.body.offsetWidth,document.body.offsetHeight)}px`;
gameContainer.style.setProperty('--proportion',`${Math.min(document.body.offsetWidth,document.body.offsetHeight)/877}`);
gameContainer.style.backgroundColor = "white";

window.addEventListener('resize', () => {
    let x = Math.min(document.body.offsetWidth,document.body.offsetHeight);
    gameContainer.style.width = `${x}px`;
    gameContainer.style.height = `${x}px`;
    gameContainer.style.setProperty('--proportion',`${x/877}`);
})


const Game = (function () {
    const array = [["","",""],
                   ["","",""],
                   ["","",""]];

    let p1Turn = true;
    let p2Turn = false;

    let winner = "none";
    let winningRow = null;

    const doTurn = function(r,c) {
        if (array[r][c] == "") {
            if (Game.p1Turn == true) {
                array[r][c] = "X";
            } else {
                array[r][c] = "O"
            }
            Game.winningRow = checkStatus();
            Game.p1Turn = !Game.p1Turn;
            Game.p2Turn = !Game.p2Turn;
            Board.refresh();
            if (Game.winningRow == null) {
                if (Game.p2Turn == true && Board.AI2True == true) {
                    let aiMove = AI.calcMove(Game.array,"P2");
                    doTurn(aiMove[0],aiMove[1]);
                } else if (Game.p1Turn == true && Board.AI1True == true) {
                    let aiMove = AI.calcMove(Game.array,"P1");
                    doTurn(aiMove[0],aiMove[1]);
                }
            }
        }
    }

    function checkLine (coord1,coord2,coord3) {
        if (array[coord1[0]][coord1[1]] == array[coord2[0]][coord2[1]] && array[coord1[0]][coord1[1]] == array[coord3[0]][coord3[1]]) {
            if (array[coord1[0]][coord1[1]] == "X") {
                Game.winner = "P1";
            } else if (array[coord1[0]][coord1[1]] == "O") {
                Game.winner = "P2";
            }
        }
    }

    function checkStatus () {
        let cases = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]]
                    ,[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]]
                    ,[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];

        for (let item of cases) {
            checkLine(item[0],item[1],item[2]);
            if (Game.winner != "none") {
                return item;
            }
        }
        return null;
    }

    const reset = function () {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                array[i][j] = "";
            }
        }
        Game.p1Turn = true;
        Game.p2Turn = false;
        Game.winner = "none";
        Game.winningRow = null;
        Board.refresh();
    }

    return {
        doTurn,
        array,
        p1Turn,
        p2Turn,
        winner,
        winningRow,
        reset
    }
})()

const Board = (function () {
    const newGameBtn = document.querySelector(".reset");

    newGameBtn.addEventListener('click', () => {
        Game.reset();
        if (Board.AI1True == true) {
            let aiMove = AI.calcMove(Game.array,"P1");
            Game.doTurn(aiMove[0],aiMove[1]);
        }
    });

    const AI1Btn = document.querySelector('.computer1');
    const AI1True = false;

    AI1Btn.addEventListener('click', () => {
        Board.AI1True = !Board.AI1True;
        AI1Btn.classList.toggle('off');
        AI1Btn.classList.toggle('on');
        if (Game.p1Turn == true) {
            let aiMove = AI.calcMove(Game.array,"P1");
            Game.doTurn(aiMove[0],aiMove[1]);
        }
    });

    const AI2Btn = document.querySelector('.computer2');
    const AI2True = false;

    AI2Btn.addEventListener('click', () => {
        Board.AI2True = !Board.AI2True;
        AI2Btn.classList.toggle('off');
        AI2Btn.classList.toggle('on');
        if (Game.p2Turn == true) {
            let aiMove = AI.calcMove(Game.array,"P2");
            Game.doTurn(aiMove[0],aiMove[1]);
        }
    });

    const slots = document.getElementsByClassName("slot");
    const p1 = document.querySelector(".p1");
    const p2 = document.querySelector(".p2");

    function arrayInList(array1,array2) {
        for (let item of array2) {
            if (array1[0] == item[0] && array1[1] == item[1]) {
                return true;
            }
        }
        return false;
    }

//game reset is done, make the refresh function act as a reset for the visuals

    const refresh = function () {
        for (let slot of slots) {
            slot.textContent = `${Game.array[slot.classList[1][1]][slot.classList[1][2]]}`;
            if (Game.winner != "none") {
                if (arrayInList([slot.classList[1][1],slot.classList[1][2]],Game.winningRow)) {
                    slot.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
                }
            } else {
                slot.style.backgroundColor = "transparent";
            }
        }
        if (Game.p1Turn == true) {
            p1.classList.add("my-turn");
        } else {
            p1.classList.remove("my-turn");
        }
        if (Game.p2Turn == true) {
            p2.classList.add("my-turn");
        } else {
            p2.classList.remove("my-turn");
        }
    }

    refresh();

    for (let slot of slots) {
        slot.addEventListener('click',() => {
            if (Game.winner == "none") {
                Game.doTurn(slot.classList[1][1],slot.classList[1][2]);
            }
        });
    }

    return {
        slots,
        refresh,
        AI1True,
        AI2True
    }
})()

const AI = (function () {
    const calcMove = function (board,player) {
        return minimax(board,0,0,0,true,player);
    }

    function checkLine (position,coord1,coord2,coord3) {
        if (position[coord1[0]][coord1[1]] == position[coord2[0]][coord2[1]] && position[coord1[0]][coord1[1]] == position[coord3[0]][coord3[1]]) {
            if (position[coord1[0]][coord1[1]] == "X") {
                return "P1";
            } else if (position[coord1[0]][coord1[1]] == "O") {
                return "P2";
            }
        }
        return "none";
    }

    function checkStatus (position) {
        let cases = [[[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]]
                    ,[[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]]
                    ,[[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]];

        for (let item of cases) {
            let status = checkLine(position,item[0],item[1],item[2]);
            if (status != "none") {
                return status;
            }
        }
        return null;
    }

    function minimax(position,depth,alpha,beta,maximizingPlayer,player) {
        const state = checkStatus(position);
        if (state != player && state != null) {
            return -1;
        } else if (state == player && state != null) {
            return 1;
        } else if (state == null) {
        const branchValues = [];
        let marker;
        if (player == "P1") {
            marker = maximizingPlayer ? "X":"O" ;
        } else if (player == "P2") {
            marker = maximizingPlayer ? "O":"X" ;
        }
        let count = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (position[i][j] == "") {
                    count += 1;
                    position[i][j] = marker;
                    branchValues.push({
                        move : [i,j],
                        value: minimax(position,depth-1,alpha,beta,!maximizingPlayer,player)
                    })
                    position[i][j] = "";
                }
            }
        }
        if (count == 0) {
            return 0;
        } else {
            if (maximizingPlayer == true) {
                branchValues.sort((a,b) => {return b.value-a.value});
                if (depth == 0) {
                    return branchValues[0].move;
                } else {
                    return branchValues[0].value;
                }
            } else {
                branchValues.sort((a,b) => {return a.value-b.value});
                if (depth == 0) {
                    return branchValues[0].move;
                } else {
                    return branchValues[0].value;
                }
            }
        }
        }
    }
    return {
        calcMove
    }
})();