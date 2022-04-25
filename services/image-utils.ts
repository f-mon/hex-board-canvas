export class ImageUtils {
  public static async imageLoad(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        res(img);
      };
      img.src = imageUrl;
    });
  }

  public static async dataUrlToCanvas(
    dataUrl: string
  ): Promise<HTMLCanvasElement> {
    const img = await ImageUtils.imageLoad(dataUrl);
    const canvas = document.createElement('canvas');
    canvas.height = img.height;
    canvas.width = img.width;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}
