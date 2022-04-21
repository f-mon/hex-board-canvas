import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel } from '../model/cell-models';
import { Cell } from './cell-view';
import { Point, Location, Tile, HexTile, Line } from '../model/geom';
import { AssetsLoader } from '../services/assets-loader';

interface BoardProps {
  boardModel: BoardModel;
}
interface BoardState {
  boardModel: BoardModel;
}

export class Board extends Component<BoardProps, BoardState> {
  myCanvas: React.RefObject<HTMLCanvasElement>;

  origin: Point;
  viewPosition: Point = new Point(0, 0);

  // in map coordinates
  hoverPosition: Point;

  tileW = 20;
  tileH = 10;
  scaleFactor = 2;

  assetsLoader: AssetsLoader;

  constructor(props: BoardProps) {
    super(props);
    this.state = {
      boardModel: this.props.boardModel,
    };
    this.myCanvas = React.createRef<HTMLCanvasElement>();
    this.assetsLoader = new AssetsLoader();
    this.assetsLoader.initialize().then(() => {
      console.log('loaded');
    });
  }

  render() {
    return (
      <div className="boardOuter">
        <canvas ref={this.myCanvas} className="board"></canvas>
      </div>
    );
  }

  componentDidMount() {
    const canvas = this.myCanvas.current as HTMLCanvasElement;
    const resizeObserver = new ResizeObserver((entries) => {
      this.setCanvasDim(canvas);
      this.redraw(canvas);
    });
    resizeObserver.observe(canvas);
    this.setUpOverPositionTracking(canvas);
    this.setUpOverZoomTracking(canvas);
    this.setUpDragging(canvas);
  }

  private setCanvasDim(canvas: HTMLCanvasElement) {
    var boundingRect = canvas.getBoundingClientRect();
    this.origin = new Point(boundingRect.left, boundingRect.top);
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
  }

  get hoverTile(): Tile {
    if (this.hoverPosition) {
      return Tile.ofPosition(this.hoverPosition);
    }
  }

  get hoverHex(): HexTile {
    if (this.hoverPosition) {
      const hoverTile = this.hoverTile;
      return hoverTile.calcHexTile(this.hoverPosition);
    }
  }

  setUpOverPositionTracking(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousemove', (event) => {
      this.hoverPosition = Point.ofRelative(event, this.origin)
        .minus(this.viewPosition)
        .inverseZoom(this.scaleFactor)
        .inverseScale(this.tileW, this.tileH);
      this.redraw(canvas);
    });
  }

  setUpOverZoomTracking(canvas: HTMLCanvasElement) {
    canvas.addEventListener('wheel', (event: WheelEvent) => {
      const zommFact = event.deltaY > 0 ? 0.9 : 1.1;

      const zoomPoint = Point.ofRelative(event, this.origin);
      const zoomLocation = zoomPoint
        .minus(this.viewPosition)
        .inverseZoom(this.scaleFactor)
        .inverseScale(this.tileW, this.tileH);

      this.scaleFactor *= zommFact;

      const movedZoomPoint = zoomLocation
        .zoom(this.scaleFactor)
        .scale(this.tileW, this.tileH)
        .add(this.viewPosition);
      const deltaZoom = movedZoomPoint.minus(zoomPoint);
      this.viewPosition = this.viewPosition.minus(deltaZoom);
      this.redraw(canvas);
    });
  }

  setUpDragging(canvas: HTMLCanvasElement) {
    let dragging = false;
    let dragPoint: Point;
    let startPosition: Point;
    canvas.addEventListener('mousemove', (event) => {
      if (dragging) {
        const deltaDrag = Point.ofRelative(event, this.origin).minus(dragPoint);
        this.viewPosition = startPosition.add(deltaDrag);
        this.redraw(canvas);
      }
    });
    canvas.addEventListener('mousedown', (event) => {
      dragging = true;
      dragPoint = Point.ofRelative(event, this.origin);
      startPosition = this.viewPosition;
    });
    canvas.addEventListener('mouseup', (event) => {
      dragging = false;
      dragPoint = null;
    });
    canvas.addEventListener('mouseout', (event) => {
      dragging = false;
      dragPoint = null;
    });
  }

  redraw(canvas: HTMLCanvasElement) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //canvas.width = canvas.width;
    const HEX_ROWS = 50;
    const HEX_COLS = 50;
    const ROWS = HEX_ROWS * 2 + 1;
    const COLS = HEX_COLS * 2;

    ctx.lineWidth = 1;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';

    //const hoverTile = this.hoverTile;
    const hoverHex = this.hoverHex;

    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = new Tile(r, c);
        this.drawGrid(tile, ctx);
      }
    }
    ctx.stroke();

    if (hoverHex) {
      this.drawHex(hoverHex, ctx);
    }
  }

  private drawGrid(tile: Tile, ctx: CanvasRenderingContext2D) {
    let line = tile.getGridLine();
    if (line) {
      line
        .scale(this.tileW, this.tileH)
        .zoom(this.scaleFactor)
        .add(this.viewPosition)
        .drawInto(ctx);
    }
  }

  private drawHex(hexTile: HexTile, ctx: CanvasRenderingContext2D) {
    ctx.save(); 
    ctx.fillStyle = 'green';
    const p = hexTile
      .getPolygon()
      .scale(this.tileW, this.tileH)
      .zoom(this.scaleFactor)
      .add(this.viewPosition);

    //ctx.fill(p.path());
    ctx.clip(p.path());
    ctx.fillStyle = 'blue';
    ctx.drawImage(this.assetsLoader.tileMap,0,0);
    ctx.restore();
  }
}
