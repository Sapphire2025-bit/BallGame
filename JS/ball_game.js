class SquarePosition {
    constructor(i, j, type) {
        this.row = i;
        this.col = j;
        this.type = type;
        this.contains = "empty"; //start all cells as empty
    }

    getPosition() {
        return [this.row, this.col];
    }

    getType() {
        return this.type;
    }

    print() {
        return (`[${this.row}, ${this.col}], type = ${this.type}, contains = ${this.contains} `)
    }
}

class Board {
    constructor(row, col) {
        this.rowSize = row;
        this.colSize = col;

        this.board = [];
        this.emptyPlaces = [];

        this.playerLocation = [];

        this.score = 0;
        this.candyOnBoard = 0;
        this.win = false;

        this.candyIntervalId = null;
    }

    createCells() {
        let type = "";
        for (let i = 0; i < this.rowSize; i++) {
            for (let j = 0; j < this.colSize; j++) {
                type = this.determineCellType(i, j);
                this.board.push(new SquarePosition(i, j, type));
                if(type == "middle")
                {
                    this.emptyPlaces.push(this.calcPositionFromRowCol(i, j));
                }
            }
        }
    }

    determineCellType(row, col) {
        //edge is lines 0 and max size -1
        if (row > 0 && row < this.rowSize - 1 && col > 0 && col < this.colSize - 1) {
            return "middle";
        }
        //we are on the border. part of it is a portal. check if we are on a portal
        //portal at 5, and 6
        else if (checkIfMiddle(row, this.rowSize) || checkIfMiddle(col, this.colSize)) {
            return "portal";
        }
        //normal border
        return "border";
    }

    determineCellColor(type)
    {
        switch (type)
        {
            case "middle":
                //gray
                return "#aeb0af";
            case "border":
                //pink
                return "#db95db";
            case "portal":
                //blue
                return "#8bcee8";
            default:
                //red
                return "#e31920";
        }
    }

    printBoard() {
        let line;
        let position;
        for (let i = 0; i < this.rowSize; i++) {
            line = "";
            for (let j = 0; j < this.colSize; j++) {
                position = this.calcPositionFromRowCol(i, j);
                line = line + this.board[position].print();
            }
            console.log(line);
        }
    }

    calcPositionFromRowCol(row, col) {
        return row * this.colSize + col;
    }

    calcRowColFromPosition(position)
    {
        return [Math.floor(position / this.colSize), position % this.colSize];
    }

    renderBoard() {
        let container = document.getElementById("boardContainer");
        //column
        let part = (100/this.colSize) + "fr ";
        let line = part.repeat(this.colSize).trim();
        container.style.gridTemplateColumns = line;
        //row
        part = "60px ";
        line = part.repeat(this.rowSize).trim();
        container.style.gridTemplateRows = line;
        let type;
        
        for (let i = 0; i < this.rowSize; i++) {
            for (let j = 0; j < this.colSize; j++) {
                type = this.board[this.calcPositionFromRowCol(i, j)].type;
                
                let newSquare = document.createElement("div");
                newSquare.style.backgroundColor = this.determineCellColor(type);
                newSquare.style.border = "1px solid black"
                //add image: for test
                //newSquare.style.backgroundImage = "url('../DATA/images/images_no_background/candy.png')";
                newSquare.style.backgroundSize = "contain";
                newSquare.style.backgroundRepeat = "no-repeat";
                newSquare.style.backgroundPosition = "center";
                container.appendChild(newSquare);
            }   
        }
    }

    addCandy()
    {
        //if game finished or no available places for candy, return
        console.log("candy");
        console.log(this.emptyPlaces)
        if(this.win || this.emptyPlaces.length < 1)
            return;
        //wait x time, put random candy (call set location ccandy)
        let location = Math.floor(Math.random() * this.emptyPlaces.length);
        this.setLocation(location, "candy");
    }

    movePlayer(code)
    {
        if(this.win)
            return;
        //check movement validity
        let [row, col] = this.playerLocation;
        switch (code)
        {
            case "KeyW":
            case "ArrowUp":
                row--;
                break;
            case "KeyS":
            case "ArrowDown":
                row++;
                break;
            case "KeyD":
            case "ArrowRight":
                col++;
                break;
            case "KeyA":
            case "ArrowLeft":
                col--;
                break;
        }
        switch (this.board[this.calcPositionFromRowCol(row, col)].type)
        {
            case "border":
                //don't move
                return;
            case "middle":
                //move normally
                break;
            case "portal":
                //calculate next side of portal:
                const isAtTopOrBottom = (row === 0 || row === this.rowSize - 1);
                const isAtLeftOrRight = (col === 0 || col === this.colSize - 1);

                if (isAtTopOrBottom)
                {
                    row = (row === 0) ? this.rowSize - 2 : 1;
                }
                
                if (isAtLeftOrRight)
                {
                    col = (col === 0) ? this.colSize - 2 : 1;
                }
                break;
        }

        //if valid call set location old to empty, new to player
        this.setLocation(this.calcPositionFromRowCol(...this.playerLocation), "empty");
        this.playerLocation = [row, col];
        this.setLocation(this.calcPositionFromRowCol(...this.playerLocation), "player");
        //check if win
        if(this.win)
            console.log("win!");
    }

    setLocation(position, newType)
    {
        switch (newType)
        {
            case "empty":
                //we get here only when player moves from this position
                //add to available empty positions
                this.emptyPlaces.push(position);
                break;
            case "player":
                //need to check if the spot contains a candy or not and update score accordingly
                if(this.board[position].contains == "candy")
                {
                    this.candyOnBoard--;
                    this.score++;
                    document.getElementById("score").textContent = this.score;
                    if(this.candyOnBoard == 0)
                    {
                        this.win = true;
                        this.endGame();
                    }
                }
                else
                {
                    //case it was an empty spot, remove place in empty positions array
                    //need to find it in the array:
                    for(let i = 0; i < this.emptyPlaces.length; i++)
                    {
                        if(this.emptyPlaces[i] == position)
                            this.emptyPlaces.splice(i, 1);
                    }
                    
                }
                break;
            case "candy":
                //put candy in a randomly chosen empty position
                //remove place in empty positions array
                //here we will be given index in empty position array,
                //as to not search the empty array each time
                //now change the position to the one on the board, and remove the index from array
                position = this.emptyPlaces.splice(position, 1);
                //update candy on board
                this.candyOnBoard++;
                break;
        }
        this.board[position].contains = newType;
        this.changeImage(position, newType);
    }

    changeImage(position, newType)
    {
        let container = document.getElementById("boardContainer");
        let chosenSquare = container.children[position];
        switch (newType)
        {
            case "empty":
                chosenSquare.style.backgroundImage = "";
                break;
            case "player":
                chosenSquare.style.backgroundImage = "url('../DATA/images/images_no_background/player.png')";
                break;
            case "candy":
                chosenSquare.style.backgroundImage = "url('../DATA/images/images_no_background/candy.png')";
                break;
        }
    }

    startGame()
    {
        this.win = false;
        this.score = 0;
        document.getElementById("score").textContent = this.score;
        document.getElementById("gameStatus").textContent = "Game in Progress...";
        let seconds = 2;
        this.candyIntervalId = setInterval(() => this.addCandy() , seconds * 1000);
    }
    
    endGame()
    {
        clearInterval(this.candyIntervalId);
        document.getElementById("gameStatus").textContent = "You Win!";
    }

}

function checkIfMiddle(position, maxSize) {
    if (maxSize % 2 == 1) {
        //if odd - the one middle is the portal
        return (position == Math.floor(maxSize / 2));
    }
    else {
        //if even, there are two middle portal squares
        return (position == maxSize / 2 || position == maxSize / 2 - 1);
    }
}

let a = new Board(5, 4);
a.createCells();
a.renderBoard();
//set player starting location:
if(a.emptyPlaces.length > 0)
{
    let location = Math.floor(Math.random() * a.emptyPlaces.length);
    a.playerLocation = a.calcRowColFromPosition(a.emptyPlaces[location]);
    a.setLocation(a.emptyPlaces[location], "player");
}

//event listeners - keys for player movements, start game button to start candy placement
window.addEventListener("keydown", (event) => {
      a.movePlayer(event.code);
    }, true);

let startButton = document.getElementById("startButton");
startButton.addEventListener('click', () => a.startGame());