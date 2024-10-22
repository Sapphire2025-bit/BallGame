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
    }

    createCells() {
        let type = "";
        for (let i = 0; i < this.rowSize; i++) {
            for (let j = 0; j < this.colSize; j++) {
                type = this.determineCellType(i, j);
                this.board.push(new SquarePosition(i, j, type));
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
                position = this.calcPosition(i, j);
                line = line + this.board[position].print();
            }
            console.log(line);
        }
    }

    calcPosition(row, col) {
        return row * this.colSize + col;
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
                //console.log(`i = ${i}, j = ${j}`);
                //console.log(this.calcPosition(i,j));
                type = this.board[this.calcPosition(i, j)].type;
                //console.log(type);
                let newSquare = document.createElement("div");
                //newSquare.style.height = "100px";
                //newSquare.style.width = (100/this.colSize) + "%";
                newSquare.style.backgroundColor = this.determineCellColor(type);
                newSquare.style.border = "1px solid black"
                //add image: for test
                newSquare.style.backgroundImage = "url('../DATA/images/images_no_background/candy.png')"
                newSquare.style.backgroundSize = "contain";
                newSquare.style.backgroundRepeat = "no-repeat";
                newSquare.style.backgroundPosition = "center";
                //let cssSquare = createCssSquare(this.board[this.calcPosition(i, j)].getType);
                container.appendChild(newSquare);
            }
            
        }
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
a.printBoard();
a.renderBoard();