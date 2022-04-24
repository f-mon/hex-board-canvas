import { Observable, Subject, Subscription } from 'rxjs';

export class TileType {
  name: string;
  canvas: HTMLCanvasElement;
  index: number;
}

export class GameModel {
  public boardModel: BoardModel;

  public turn: number = 0;
  private _speed: number = 700;

  public running: boolean = false;
  private scheduledTick: number;

  private updates = new Subject<GameModel>();

  constructor(
    speed: number,
    public readonly rows: number,
    public readonly cols: number
  ) {
    this._speed = speed;
    this.boardModel = new BoardModel(this);
  }

  onUpdate(): Observable<GameModel> {
    return this.updates;
  }

  notifyChanged() {
    this.updates.next(this);
  }

  tick() {
    if (!this.running) {
      return;
    }
    this.turn++;
    const updateCells: boolean[][] = [];
    for (let row of this.boardModel.cells) {
      const updateRow: any[] = [];
      updateCells.push(updateRow);
      for (let cell of row) {
        updateRow.push(cell.calcNextState());
      }
    }
    for (let r = 0; r < this.boardModel.cells.length; r++) {
      for (let c = 0; c < this.boardModel.cells[r].length; c++) {
        const cell = this.boardModel.cells[r][c];
        const prevActive = cell.active;
        cell.active = updateCells[r][c];
        if (prevActive !== cell.active) {
          cell.notifyChanged();
        }
      }
    }
    this.notifyChanged();
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.scheduledTick = setInterval(() => this.tick(), this._speed);
  }

  stop() {
    if (!this.running) {
      return;
    }
    if (this.scheduledTick) {
      clearInterval(this.scheduledTick);
    }
    this.running = false;
  }

  exportAndSaveState() {
    const mem = this.exportState();
    localStorage.setItem('boardState', JSON.stringify(mem));
  }

  exportState() {
    const state: any = {};
    this.boardModel.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.backgroundColor) {
          state[cell.key] = {
            backgroundColor: cell.backgroundColor,
          };
        }
      });
    });
    return state;
  }

  reloadState() {
    const mem = localStorage.getItem('boardState');
    if (mem) {
      const parsedMem = JSON.parse(mem);
      this.loadState(parsedMem);
    }
    this.notifyChanged();
  }

  loadState(state: { [cellKey: string]: any }) {
    Object.keys(state).forEach((key) => {
      const loc = CellModel.getLocationFromKey(key);
      const cell = this.boardModel.getCell(loc.row, loc.col);
      if (cell) {
        cell.backgroundColor = state[key].backgroundColor;
        cell.notifyChanged();
      }
    });
  }

  private _selectedTypeType: TileType;

  get selectedTypeType(): TileType {
    return this._selectedTypeType;
  }

  isSelectedTileType(tileType: TileType): boolean {
    return this._selectedTypeType === tileType;
  }

  selectTileType(tileType: TileType) {
    this._selectedTypeType = tileType;
  }

  static reloadFromLocalStorage() {
    const mem = localStorage.getItem('game_model');
    if (mem) {
      const pMem = JSON.parse(mem);
      const restoredGame = new GameModel(pMem.speed, pMem.rows, pMem.cols);
      for (let r = 0; r < pMem.cells.length; r++) {
        for (let c = 0; c < pMem.cells[r].length; c++) {
          const pCell = pMem.cells[r][c];
          const cellModel = restoredGame.boardModel.cells[r][c];
          //cellModel.set;
        }
      }

      return restoredGame;
    } else {
      return new GameModel(500, 50, 50);
    }
  }
}

export class BoardModel {
  cells: CellModel[][];
  readonly tileW: number = 20;
  readonly tileH: number = 10;

  private _selection: Set<CellModel> = new Set();

  turn: number = 0;

  constructor(public readonly gameModel: GameModel) {
    this.cells = [...Array(gameModel.rows)].map((x, r) => {
      return [...Array(gameModel.cols)].map((x, c) => {
        return new CellModel(this, r, c);
      });
    });
  }

  get hexW(): number {
    return this.tileW * 2;
  }

  get hexH(): number {
    return this.tileH * 3;
  }

  getCell(row: number, col: number): CellModel | null {
    if (row < 0 || row >= this.cells.length) {
      return null;
    }
    if (col < 0 || col >= this.cells[row].length) {
      return null;
    }
    return this.cells[row][col];
  }

  toggleSelected(cellModel: CellModel) {
    return this.setSelected(cellModel, !this.isSelected(cellModel));
  }

  setSelected(cellModel: CellModel, selected: boolean = true) {
    if (selected) {
      if (!this._selection.has(cellModel)) {
        this._selection.add(cellModel);
        cellModel.notifyChanged();
        this.gameModel.notifyChanged();
      }
    } else {
      if (this._selection.has(cellModel)) {
        this._selection.delete(cellModel);
        cellModel.notifyChanged();
        this.gameModel.notifyChanged();
      }
    }
  }

  clearCelection() {
    this._selection.forEach((cell) => {
      this._selection.delete(cell);
      cell.notifyChanged();
    });
    this.gameModel.notifyChanged();
  }

  isSelected(cellModel: CellModel): boolean {
    return this._selection.has(cellModel);
  }

  hasSelected(): boolean {
    return this._selection.size > 0;
  }

  get selection(): ReadonlySet<CellModel> {
    return this._selection;
  }

  get rows(): number {
    return this.gameModel.rows;
  }

  get cols(): number {
    return this.gameModel.cols;
  }
}

export enum CellDirection {
  N = 'N',
  S = 'S',
  EN = 'EN',
  ES = 'ES',
  WN = 'WN',
  WS = 'WS',
}

export class CellModel {
  active: boolean;
  backgroundColor: string;

  key: string;

  private updates = new Subject<CellModel>();

  constructor(
    public readonly boardMode: BoardModel,
    public readonly row: number,
    public readonly col: number
  ) {
    this.key = 'cell_' + this.row + '_' + this.col;
  }

  static getLocationFromKey(cellKey: string): {
    row: number;
    col: number;
  } {
    const sepIdx = cellKey.indexOf('_', 5);
    const row = parseInt(cellKey.substr(5, sepIdx));
    const col = parseInt(cellKey.substr(sepIdx + 1));
    return {
      row: row,
      col: col,
    };
  }

  onUpdate(): Observable<CellModel> {
    return this.updates;
  }

  calcNextState(): boolean {
    const activatedNear = this.getNearCells().filter(
      (cell) => cell.active
    ).length;
    if (activatedNear === 2) {
      return this.active;
    }
    if (activatedNear === 3) {
      return true;
    }
    if (activatedNear === 4) {
      return this.active;
    }
    return false;
  }

  activate(activateNears?: boolean) {
    this.active = true;

    this.notifyChanged();
    if (activateNears !== false) {
      const nearCells = this.getNearCells();
      console.log('nearCells ', nearCells);
      nearCells.forEach((cell) => cell.activate(false));
    }
  }

  notifyChanged() {
    this.updates.next(this);
  }

  isSelectedCell(): boolean {
    return this.boardMode.isSelected(this);
  }

  isOddCell() {
    return this.col % 2 === 1;
  }

  getCell(cellDir: CellDirection): CellModel {
    const oddDelta = this.isOddCell() ? 1 : 0;
    switch (cellDir) {
      case CellDirection.N:
        return this.boardMode.getCell(this.row - 1, this.col);
      case CellDirection.S:
        return this.boardMode.getCell(this.row + 1, this.col);
      case CellDirection.EN:
        return this.boardMode.getCell(this.row - 1 + oddDelta, this.col + 1);
      case CellDirection.ES:
        return this.boardMode.getCell(this.row + oddDelta, this.col + 1);
      case CellDirection.WN:
        return this.boardMode.getCell(this.row - 1 + oddDelta, this.col - 1);
      case CellDirection.WS:
        return this.boardMode.getCell(this.row + oddDelta, this.col - 1);
    }
  }

  getNearCells(): CellModel[] {
    return Object.values(CellDirection)
      .map((dir) => this.getCell(dir))
      .filter((cell) => !!cell);
  }
}
