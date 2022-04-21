export class AssetsLoader {
  tileMap: HTMLImageElement;

  constructor() {}

  initialize(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tileMap = new Image(); // Create new img element
      this.tileMap.addEventListener(
        'load',
        () => {
          resolve(true);
        },
        false
      );
      this.tileMap.src =
        'https://raw.githubusercontent.com/f-mon/hex-board-canvas/master/images/tileMap.png';
    });
  }
}
