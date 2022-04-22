export class AssetsLoader {
  tileMap: HTMLImageElement;
  private _loaded: boolean = false;

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
