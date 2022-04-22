import { Rect } from '../model/geom';

export class AssetsLoader {
  tileMap: HTMLImageElement;
  private _loaded: boolean = false;

  readonly tiles: HTMLCanvasElement[] = [];

  constructor() {}

  initialize(): Promise<any> {
    return this.imageLoad(
      'https://raw.githubusercontent.com/f-mon/hex-board-canvas/master/images/tileMap.png'
    ).then((img) => {
      this.tileMap = img;
      this._loaded = true;
    });
  }

  get loaded(): boolean {
    return this.loaded;
  }

  createMapTile(rect: Rect) {
    const tileMapCanvas = document.createElement('canvas');
    tileMapCanvas.width = rect.width;
    tileMapCanvas.height = rect.height;
    const ctx = tileMapCanvas.getContext('2d');
    console.log(rect);
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
    this.tiles.push(tileMapCanvas);
    console.log(this.tiles);
    document.body.appendChild(tileMapCanvas);
  }

  imageLoad(imgSrc: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      console.log('create image');
      const img = new Image(); // Create new img element
      img.addEventListener(
        'load',
        () => {
          console.log('loaded');
          resolve(img);
        },
        false
      );
      img.src = imgSrc;
    });
  }
}
