/** Connect Four
 *
 * Peter Darinzo
 * 07/05/2021
 * 
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = "p1"; // active player: p1 or p2
const board = []; // array of rows, each row is array of cells  (board[y][x])
const htmlBoard = document.getElementById("board");
const headerRow = document.getElementById("header-row");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const playerOneColor = document.getElementById("p1-color");
const playerTwoColor = document.getElementById("p2-color");
const playerOneScore = document.getElementById("p1-score");
const playerTwoScore = document.getElementById("p2-score");
const eraseButton = document.getElementById("erase-button");

/*
*  global variables for default piece colors and player win tallys
*/
let p1Color = "red";
let p2Color = "yellow";
let p1WinCount = 0;
let p2WinCount = 0;
let gameInProgress = false;
let boardClear = true;

/*
* Event Handlers For Color Selection, Start, Rest, and Scoreboard Erase Buttons
*/

playerOneColor.addEventListener("click", (e) => {
  // players can only change colors if a game is not in progress
  // also ensure CSS properties only take affect when a click is placed in a color span
  if (!gameInProgress && e.target.tagName === "SPAN") {
    const colors = playerOneColor.children;
    for (let color of colors) {
      color.classList.remove("expand");
    }
    p1Color = e.target.id;
    e.target.classList.add("expand");
  }
});


playerTwoColor.addEventListener("click", (e) => {
  if (!gameInProgress && e.target.tagName === "SPAN") {
    const colors = playerTwoColor.children;
    for (let color of colors) {
      color.classList.remove("expand");
    }
    p2Color = e.target.id;
    e.target.classList.add("expand");
  }
});


eraseButton.addEventListener("click", () => {
  clearScore();
});


startButton.addEventListener("click", (e) => {
  e.preventDefault();

  // if board is clear:
  // the game has just been initialized or,
  // the reset button has been pushed
  // make the sure the board is clear, then set the gameInProgress and boardClear booleans
  if (boardClear) {
    gameInProgress = true;
    boardClear = false;
    startButton.innerText = "GAME \n RUNNING!";
  }
});


resetButton.addEventListener("click", (e) => {
  e.preventDefault();
  clearBoard();
  // board has been cleared, reset boolean so a new game can be started
  boardClear = true;
  resetButton.classList.remove("button-glow");
  startButton.innerHTML = "START GAME!"
});


/* 
* Scoreboard functions 
* restore scoreboard upon opening browser
* update scoreboard after a game
* reset or "erase" scoreboard
*/

// check local storage for scores
// if none present, create the storage object
function restoreScoreBoard() {
  const json = localStorage.getItem("connect-four-scores");
  if (json) {
    p1WinCount = JSON.parse(json).p1;
    p2WinCount = JSON.parse(json).p2;
  } else {
    localStorage.setItem("connect-four-scores", JSON.stringify({ "p1": 0, "p2": 0 }));
  }
  updateScoreBoard(p1WinCount, p2WinCount);
}


function updateScoreBoard(p1Wins, p2Wins) {
  playerOneScore.innerText = `Player 1: ${p1Wins}`;
  playerTwoScore.innerText = `Player 2: ${p2Wins}`;
}

// set both player win count to 0
// then update local storage and the scoreboard
function clearScore() {
  p1WinCount = 0;
  p2WinCount = 0;
  localStorage.setItem("connect-four-scores", JSON.stringify({ "p1": 0, "p2": 0 }));
  updateScoreBoard(p1WinCount, p2WinCount);
}


/** makeBoard: create in-JS board structure:
 *  board = array of rows, each row is array of cells  (board[y][x])
 */

// nested for loops to make 2D arry filled with value "null" to indicate empty cells
function makeBoard() {
  for (let row = 0; row < HEIGHT; row++) {
    board.push([]);
    for (let col = 0; col < WIDTH; col++) {
      board[row].push(null);
    }
  }
}


// clear the HTML view board and JS model board when the reset button is clicked
function clearBoard() {

  // get all rows of the board
  const rows = htmlBoard.children;

  // go through each row and get each cell
  for (let row of rows) {
    const cells = row.children;
    for (let cell of cells) {
      if (cell.hasChildNodes()) {

        // if a cell contains a child (a piece)
        // translate it 600 px downard to mimic falling from the board
        // then delete it
        const piece = cell.firstChild;
        setTimeout(() => {
          piece.remove()
        }, 1000);
        setTimeout(() => {
          piece.style.transitionTimingFunction = "ease-out";
          piece.style.transform += `translateY(${600}px)`;
        }, 100)
      }
    }
  }

  // completely clear the JS board model array, then refill it
  board.splice(0, 6);
  makeBoard();
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {

  // create a seperate top row in order to give different styling from the game board
  // add the event listener to handle clicks
  // set ID to apply CSS which makes it turn gold upon hover
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  // create a cell for each column
  // set its ID to its X coordinate
  //append each cell into the top row
  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", `${x}`);
    top.append(headCell);
  }

  // append the entire row to the headerRow table
  headerRow.append(top);

  // for each row in the board, create an HTML row
  // for each column in each row, create a cell
  // set the cell's ID to it's coordinates, and append it to the row
  // finally prepend the row to the game board
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    // prepend each row so that y = 0 is the bottom row, and increases with each row going up
    htmlBoard.prepend(row);
  }
}


/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
  for (let y = 0; y < HEIGHT; y++) {
    if (board[y][x] === null) {
      return y;
    }
  }
  return null;
}


/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {

  const piece = document.createElement('div');
  piece.setAttribute("class", "piece");

  // get the appropriate spot on the board to append the piece
  const cell = document.getElementById(`${y}-${x}`);

  cell.append(piece); // piece must be appended to cell, (or somewhere in the document) or it won't appear

  // set appropriate piece color depending on the player
  currPlayer === "p1" ? piece.style.backgroundColor = `${p1Color}` : piece.style.backgroundColor = `${p2Color}`;

  // get the final position of the piece: the x-y pixel coordinates of the spot in the board
  const pieceFinalPos = getPosition(cell);
  const { xPos, yPos } = pieceFinalPos;

  // move the piece appropriate amount from the left
  piece.style.left = `${xPos}px`;

  // piece starts above the view window, then translates down to the appropriate spot
  setTimeout(() => {
    piece.style.transform += `translateY(${yPos + 65}px)`;
  }, 100)
}


/** endGame: announce game end */
function endGame(msg) {
  setTimeout(() => {
    alert(msg);
    resetButton.classList.add("button-glow");
  }, 500);
  gameInProgress = false;
}


const togglePlayer = () => currPlayer === "p1" ? currPlayer = "p2" : currPlayer = "p1";


const updateBoardModel = (y, x) => currPlayer === "p1" ? board[y][x] = "p1" : board[y][x] = "p2";


const isRowFull = (row) => {
  return row.every((cell) => {
    return cell != null;
  });
}


const isBoardFull = (b) => {
  return b.every((row) => {
    return isRowFull(row);
  });
}


/* 
* Determine the coordinates of the spot on the game board where the piece is to be placed
* 
* Adapted from www.kirupa.com
* https://www.kirupa.com/html5/get_element_position_using_javascript.htm
* Written by Kirupa Chinnathambi
* 03/16/2016
*/
const getPosition = (el) => {
  let xPos = 0;
  let yPos = 0;

  // keep a running tally of the offsets of all elements
  // that are parent to el
  while (el) {
    xPos += el.offsetLeft + el.clientLeft;
    yPos += el.offsetTop + el.clientTop;

    // el becomes the nearest positioned ancestor element
    // until el becomes <body> or <html>
    el = el.offsetParent;
  }
  return { xPos, yPos };
}


/** Update scoreboard, and memory with the player win counts */
function updateScore() {
  currPlayer === "p1" ? p1WinCount++ : p2WinCount++;
  updateScoreBoard(p1WinCount, p2WinCount);
  localStorage.setItem("connect-four-scores", JSON.stringify({ "p1": p1WinCount, "p2": p2WinCount }))
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  if (gameInProgress) {

    // get x from ID of clicked cell
    let x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    let y = findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    placeInTable(y, x);

    updateBoardModel(y, x);

    // check for win, then send alert with winning player
    if (checkForWin()) {
      updateScore();
      currPlayer === "p1" ? endGame("Player 1 won!") : endGame("Player 2 won!");
    }

    // check for tie
    if (isBoardFull(board)) {
      return endGame("TIE");
    }

    // switch players
    togglePlayer();
  }
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {

    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    // current value is a coordinate pair
    // for every pair, check that the coordinate is within the board 
    // i.e. don't check for a winning combination that goes outside the board
    // then check to see if every pair in the array is a winning players piece
    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      //from a coordinate position, make an array with the three cells to the right
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      // from a coordinate position, make an array with the three cell above
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      // from a coordinate position, make an array with the three cells
      // above and to the left diagonally
      // or above and to the right diagonally
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      // if all pieces in any of the combinations belong to the winner, return true
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}


makeBoard();
makeHtmlBoard();
restoreScoreBoard();