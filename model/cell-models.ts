import { Observable, Subject, Subscription } from 'rxjs';
import { AssetsLoader } from '../services/assets-loader';
import { Tile } from './geom';
import { ImageUtils } from '../services/image-utils';

export class TileType {
  constructor(
    public readonly index: number,
    public readonly canvas: HTMLCanvasElement
  ) {
    if (!index || index === NaN) {
      throw new Error();
    }
  }

  get name(): string {
    return 'tile_image_' + this.index;
  }

  persistToLocalStorage() {
    localStorage.setItem(this.name, this.canvas.toDataURL());
  }

  deleteFromLocalStorage() {
    localStorage.removeItem(this.name);
  }

  static async reloadTilesFromLocalStorage(): Promise<Array<TileType>> {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('tile_image_')) {
        const index = parseInt(key.substring(11));
        if (!index || index === NaN || index === Infinity) {
          continue;
        }
        const canvasTile = await ImageUtils.dataUrlToCanvas(
          localStorage.getItem(key)
        );
        result.push(new TileType(index, canvasTile));
      }
    }
    result.sort((a, b) => a.index - b.index);
    console.log(result);
    return result;
  }
}

export class GameModel {
  public boardModel: BoardModel;

  private _selectedTileType: TileType;

  private updates = new Subject<GameModel>();

  constructor(public readonly rows: number, public readonly cols: number) {
    this.boardModel = new BoardModel(this);
  }

  onUpdate(): Observable<GameModel> {
    return this.updates;
  }

  notifyChanged() {
    this.updates.next(this);
  }

  get selectedTileType(): TileType {
    return this._selectedTileType;
  }

  isSelectedTileType(tileType: TileType): boolean {
    return this._selectedTileType === tileType;
  }

  selectTileType(tileType: TileType) {
    this._selectedTileType = tileType;
  }

  isDrawingMapState(): boolean {
    return !!this._selectedTileType;
  }

  isEditTilesPaletteState(): boolean {
    return !this._selectedTileType;
  }

  setCellTileType(row: number, col: number, tileType: TileType): boolean {
    const cell = this.boardModel.getCell(row, col);
    if (cell && cell.setTileType(this._selectedTileType)) {
      this.saveStateToLocalStorage();
      return true;
    }
    return false;
  }

  saveStateToLocalStorage() {}

  static reloadFromLocalStorage(assetsLoader: AssetsLoader) {
    const mem = localStorage.getItem('game_model');
    if (mem) {
      const pMem = JSON.parse(mem);
      const restoredGame = new GameModel(pMem.rows, pMem.cols);
      for (let r = 0; r < pMem.cells.length; r++) {
        for (let c = 0; c < pMem.cells[r].length; c++) {
          const pCell = pMem.cells[r][c];
          const cellModel = restoredGame.boardModel.cells[r][c];
          cellModel.setTileType(assetsLoader.getTileTypeByName(pCell.type));
        }
      }

      return restoredGame;
    } else {
      return new GameModel(50, 50);
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

  clearSelection() {
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
  private _tileType: TileType;

  key: string;

  private updates = new Subject<CellModel>();

  constructor(
    public readonly boardMode: BoardModel,
    public readonly row: number,
    public readonly col: number
  ) {
    this.key = 'cell_' + this.row + '_' + this.col;
  }

  onUpdate(): Observable<CellModel> {
    return this.updates;
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

  get tileType(): TileType {
    return this._tileType;
  }

  setTileType(tileType: TileType): boolean {
    if (this._tileType !== tileType) {
      this._tileType = tileType;
      return true;
    }
    return false;
  }
}
