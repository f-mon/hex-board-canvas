import { Observable, Subject } from 'rxjs';
import { Rect } from '../model/geom';

export class TileImage {
  tileName: string;
  canvas: HTMLCanvasElement;
  index: number;
}

export class AssetsLoader {
  tileMap: HTMLImageElement;
  private _loaded: boolean = false;

  readonly tiles: TileImage[] = [];
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
    this.tileMap = await this.imageLoad(
      'https://raw.githubusercontent.com/f-mon/hex-board-canvas/master/images/tileMap.png'
    );
    await this.reloadTiles();
    this._loaded = true;
    this.notifyChanged();
  }

  private async reloadTiles(): Promise<any> {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('tile_image_')) {
        const imgNum = parseInt(key.substring(11));
        this.nextKey = Math.max(imgNum, this.nextKey);
        const canvasTile = await this.dataUrlToCanvas(
          localStorage.getItem(key)
        );
        this.tiles.push({
          index: imgNum,
          tileName: key,
          canvas: canvasTile,
        });
      }
    }
    this.tiles.sort((a, b) => a.index - b.index);
    console.log(this.tiles);
  }

  private async dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
    const img = await this.imageLoad(dataUrl);
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = img.width;
    tileCanvas.height = img.height;
    const ctx = tileCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return tileCanvas;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  createMapTile(rect: Rect) {
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
    const tileName = 'tile_image_' + this.nextKey;
    this.tiles.push({
      index: this.nextKey,
      tileName,
      canvas: tileMapCanvas,
    });
    localStorage.setItem(tileName, tileMapCanvas.toDataURL());
    this.notifyChanged();
  }

  imageLoad(imgSrc: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image(); // Create new img element
      img.crossOrigin = 'anonymous';
      img.addEventListener(
        'load',
        () => {
          resolve(img);
        },
        false
      );
      img.src = imgSrc;
    });
  }
}
