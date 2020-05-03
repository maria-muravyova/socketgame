class GameManager {
  constructor() {
    this.SIZE = 3;

    this.winStates = Object.freeze({
      NO_WIN: 0,
      TOKEN_1_WON: 1,
      TOKEN_2_WON: 2,  
    });

    this.winGroups = [
      // verticals
      [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      // horizontals
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
      // diagonals
      [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
      [{ x: 0, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
    ];

    this.tokenMap = {
      0: ' ',
      1: 'X',
      2: 'O',
    };

    this.players = [
      { token: 1 },
      { token: 2 },
    ];
  }

  init() {
    this.field = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    this.currentWinState = this.winStates.NO_WIN;
  }

  getWinState() {
    return this.currentWinState;
  }

  getField() {
    return this.field;
  }

  makeMove(playerIndex, rowIndex, columnIndex) {
    const player = this.players[playerIndex];
    if (this.field[rowIndex][columnIndex] === 0) {
      this.field[rowIndex][columnIndex] = player.token;
      this.currentWinState = this.checkWinState();
    } else {
      console.log('This cell is busy');
    }
  }

  checkWinState() {
    for (const winGroup of this.winGroups) {
      const firstCell = winGroup[0];
      const firstCellValue = this.field[firstCell.x][firstCell.y];

      if (firstCellValue === 0) {
        continue;
      }

      let isSame = true;
      for (const cell of winGroup) {
        if (firstCellValue !== this.field[cell.x][cell.y]) {
          isSame = false;
        }
      }

      if (!isSame) {
        continue;
      }

      return firstCellValue === 1 
        ? this.winStates.TOKEN_1_WON
        : this.winStates.TOKEN_2_WON;
    }
    
    return this.winStates.NO_WIN;
  }
}

const game = new GameManager();
game.init();
game.makeMove(1, 0, 0);
game.makeMove(0, 0, 1);
game.makeMove(1, 1, 1);
game.makeMove(0, 2, 1);
game.makeMove(1, 2, 2);
console.table(game.getField());
console.log(game.getWinState());