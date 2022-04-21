export class Point {
  constructor(public readonly x: number, public readonly y: number) {}

  static of(event: MouseEvent): Point {
    return new Point(event.clientX, event.clientY);
  }

  static ofRelative(event: MouseEvent, relativeTo: Point): Point {
    return Point.of(event).minus(relativeTo);
  }

  add(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  minus(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  scale(xScale: number, yScale: number): Point {
    return new Point(this.x * xScale, this.y * yScale);
  }

  inverseScale(xScale: number, yScale: number): Point {
    return this.scale(1 / xScale, 1 / yScale);
  }

  zoom(zoomFactor: number): Point {
    return this.scale(zoomFactor, zoomFactor);
  }

  inverseZoom(zoomFactor: number): Point {
    return this.scale(1 / zoomFactor, 1 / zoomFactor);
  }
}

export class Location {
  constructor(public readonly row: number, public readonly col: number) {}
}

export class Tile extends Location {
  readonly crossA: boolean;
  readonly crossB: boolean;
  readonly uniformLeft: boolean;
  readonly uniformRight: boolean;
  readonly shiftedRow: boolean;

  static ofPosition(pos: Point): Tile {
    let row = Math.floor(pos.y);
    let col = Math.floor(pos.x);
    return new Tile(row, col);
  }

  constructor(public readonly row: number, public readonly col: number) {
    super(row, col);
    const row4Idx = this.row % 4;
    this.uniformLeft = row4Idx === 1 && this.col % 2 === 0;
    this.uniformRight = row4Idx === 3 && this.col % 2 === 1;
    this.crossA =
      (row4Idx === 0 && this.col % 2 === 0) ||
      (row4Idx === 2 && this.col % 2 === 1);
    this.crossB =
      (row4Idx === 0 && this.col % 2 === 1) ||
      (row4Idx === 2 && this.col % 2 === 0);
    this.shiftedRow = row4Idx === 2 || row4Idx === 3;
  }

  get point() {
    return new Point(this.col, this.row);
  }

  get pointLeftBottom() {
    return new Point(this.col, this.row + 1);
  }

  get pointRightBottom() {
    return new Point(this.col + 1, this.row + 1);
  }

  get pointRightTop() {
    return new Point(this.col + 1, this.row);
  }

  public calcHexTile(position: Point): HexTile {
    let row = Math.floor(this.row / 2);
    let col = Math.floor(this.col / 2);

    if (this.crossA) {
      const l1 = this.pointLeftBottom;
      const l2 = this.pointRightTop;
      const line = new Line(l1, l2);
      const side = line.side(position);
      if (side === -1) {
        row--;
        if (this.row % 4 === 0) {
          col--;
        }
      }
    } else if (this.crossB) {
      const l1 = this.point;
      const l2 = this.pointRightBottom;
      const line = new Line(l1, l2);
      const side = line.side(position);
      if (side === -1) {
        row--;
      }
      if (side === 1 && this.row % 4 === 2) {
        col--;
      }
    } else {
      if (this.row % 4 === 3 && this.col % 2 === 0) {
        col--;
      }
    }
    return row >= 0 && col >= 0 ? new HexTile(row, col) : null;
  }

  getGridLine(): Line {
    if (this.uniformLeft || this.uniformRight) {
      return new Line(
        new Point(this.col, this.row),
        new Point(this.col, this.row + 1)
      );
    } else if (this.crossA) {
      return new Line(
        new Point(this.col, this.row + 1),
        new Point(this.col + 1, this.row)
      );
    } else if (this.crossB) {
      return new Line(
        new Point(this.col, this.row),
        new Point(this.col + 1, this.row + 1)
      );
    }
  }
}

export class HexTile extends Location {
  getBoundingRect(): Rect {
    let shiftX = 0;
    if (this.row % 2 === 1) {
      shiftX = 1;
    }
    return new Rect(
      new Point(this.col * 2 + shiftX, this.row * 2),
      new Point(this.col * 2 + 2 + shiftX, this.row * 2 + 3)
    );
  }

  getPolygon(): HexPolygon {
    const rect = this.getBoundingRect();
    return new HexPolygon([
      rect.upperLeft.add(new Point(0, 1)),
      rect.upperLeft.add(new Point(1, 0)),
      rect.upperLeft.add(new Point(2, 1)),
      rect.upperLeft.add(new Point(2, 2)),
      rect.upperLeft.add(new Point(1, 3)),
      rect.upperLeft.add(new Point(0, 2)),
    ]);
  }
}

export class Line {
  constructor(public readonly l1: Point, public readonly l2: Point) {}

  public side(p: Point): number {
    return Math.sign(
      (this.l2.x - this.l1.x) * (p.y - this.l1.y) -
        (this.l2.y - this.l1.y) * (p.x - this.l1.x)
    );
  }

  scale(xScale: number, yScale: number): Line {
    return new Line(
      this.l1.scale(xScale, yScale),
      this.l2.scale(xScale, yScale)
    );
  }

  zoom(scale: number): Line {
    return this.scale(scale, scale);
  }

  add(translate: Point): Line {
    return new Line(this.l1.add(translate), this.l2.add(translate));
  }

  drawInto(ctx: CanvasRenderingContext2D) {
    ctx.moveTo(this.l1.x, this.l1.y);
    ctx.lineTo(this.l2.x, this.l2.y);
  }
}

export class Rect {
  constructor(
    public readonly upperLeft: Point,
    public readonly lowerRight: Point
  ) {}

  scale(xScale: number, yScale: number): Rect {
    return new Rect(
      this.upperLeft.scale(xScale, yScale),
      this.lowerRight.scale(xScale, yScale)
    );
  }

  minus(translate: Point): Rect {
    return new Rect(
      this.upperLeft.minus(translate),
      this.lowerRight.minus(translate)
    );
  }

  add(translate: Point): Rect {
    return new Rect(
      this.upperLeft.add(translate),
      this.lowerRight.add(translate)
    );
  }

  get width(): number {
    return this.lowerRight.x - this.upperLeft.x;
  }

  get height(): number {
    return this.lowerRight.y - this.upperLeft.y;
  }
}

class HexPolygon {
  constructor(public readonly points: ReadonlyArray<Point>) {}

  scale(xScale: number, yScale: number): HexPolygon {
    return new HexPolygon(this.points.map((p) => p.scale(xScale, yScale)));
  }

  zoom(zoomFActor: number): HexPolygon {
    return this.scale(zoomFActor, zoomFActor);
  }

  add(translate: Point): HexPolygon {
    return new HexPolygon(this.points.map((p) => p.add(translate)));
  }

  path(): Path2D {
    const [first, ...others] = this.points;
    const path = new Path2D();
    path.moveTo(first.x, first.y);
    for (let p of others) {
      path.lineTo(p.x, p.y);
    }
    path.closePath();
    return path;
  }
}
