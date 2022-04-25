import { Observable, Subject } from 'rxjs';
import { TileType } from '../model/cell-models';
import { Rect } from '../model/geom';
import { ImageUtils } from './image-utils';

export class AssetsLoader {
  tileMap: HTMLImageElement;
  private _loaded: boolean = false;

  private _tiles: TileType[] = [];
  private nextKey: number = 0;

  private updates = new Subject<any>();

  onUpdate(): Observable<any> {
    return this.updates;
  }

  notifyChanged() {
    this.updates.next(this);
  }

  constructor() {}

  async initialize(): Promise<any> {
    this.tileMap = await ImageUtils.imageLoad(
      'https://raw.githubusercontent.com/f-mon/hex-board-canvas/master/images/tileMap.png'
    );
    await this.reloadTiles();
    this._loaded = true;
    this.notifyChanged();
  }

  private async reloadTiles(): Promise<any> {
    const tiles = await TileType.reloadTilesFromLocalStorage();
    if (tiles.length > 0) {
      this.nextKey = Math.max(...tiles.map((t) => t.index));
      this._tiles = tiles;
    }
  }

  get tiles(): TileType[] {
    return this._tiles;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  deleteTileType(tileType: TileType) {
    const idx = this.tiles.indexOf(tileType);
    if (idx >= 0) {
      const [deleted] = this.tiles.splice(idx, 1);
      deleted.deleteFromLocalStorage();
      this.notifyChanged();
    }
  }

  createMapTile(rect: Rect): TileType {
    const tileMapCanvas = document.createElement('canvas');
    tileMapCanvas.width = rect.width;
    tileMapCanvas.height = rect.height;
    const ctx = tileMapCanvas.getContext('2d');
    ctx.drawImage(
      this.tileMap,
      rect.upperLeft.x,
      rect.upperLeft.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );
    this.nextKey++;
    const newTileType = new TileType(this.nextKey, tileMapCanvas);
    this.tiles.push(newTileType);
    newTileType.persistToLocalStorage();
    this.notifyChanged();
    return newTileType;
  }

  getTileTypeByName(tileTypeName: string): TileType {
    return this.tiles.find((tt) => tt.name === tileTypeName);
  }
}
