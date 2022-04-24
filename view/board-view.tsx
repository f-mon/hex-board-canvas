import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel, TileType } from '../model/cell-models';
import { Cell } from './cell-view';
import { Point, Location, Tile, HexTile, Line } from '../model/geom';
import { AssetsLoader } from '../services/assets-loader';

interface BoardProps {
  boardModel: BoardModel;
  assetsLoader: AssetsLoader;
}
interface BoardState {
  boardModel: BoardModel;
}

export class Board extends Component<BoardProps, BoardState> {
  canvasContainer: React.RefObject<HTMLDivElement>;
  myCanvas: React.RefObject<HTMLCanvasElement>;

  origin: Point;
  viewPosition: Point = new Point(0, 0);

  // in map coordinates
  hoverPosition: Point;

  readonly tileW: number;
  readonly tileH: number;
  scaleFactor = 2;

  assetsLoader: AssetsLoader;

  constructor(props: BoardProps) {
    super(props);
    this.state = {
      boardModel: this.props.boardModel,
    };
    this.myCanvas = React.createRef<HTMLCanvasElement>();
    this.canvasContainer = React.createRef<HTMLDivElement>();
    this.assetsLoader = this.props.assetsLoader;
    this.tileW = this.state.boardModel.tileW;
    this.tileH = this.state.boardModel.tileH;
  }

  render() {
    return (
      <div ref={this.canvasContainer} className="boardOuter">
        <canvas ref={this.myCanvas} className="board"></canvas>
      </div>
    );
  }

  componentDidMount() {
    const canvas = this.myCanvas.current as HTMLCanvasElement;
    const resizeObserver = new ResizeObserver((entries) => {
      this.setCanvasDim(canvas, entries[0].target.getBoundingClientRect());
      this.redraw(canvas);
    });
    resizeObserver.observe(canvas); //this.canvasContainer.current);
    this.setUpOverPositionTracking(canvas);
    this.setUpOverZoomTracking(canvas);
    this.setUpDragging(canvas);
    this.setUpClick(canvas);
  }

  private setCanvasDim(
    canvas: HTMLCanvasElement,
    boundingRect: DOMRectReadOnly
  ) {
    //var boundingRect = canvas.getBoundingClientRect();
    this.origin = new Point(boundingRect.left, boundingRect.top);
    canvas.height = boundingRect.height;
    canvas.width = boundingRect.width;
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

  getHexTileFromMapPosition(position: Point): HexTile {
    return Tile.ofPosition(position).calcHexTile(position);
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

  setUpClick(canvas: HTMLCanvasElement) {
    canvas.addEventListener(
      'dblclick',
      (event) => {
        const gameModel = this.state.boardModel.gameModel;
        if (gameModel.isDrawingMapState()) {
          const hexTile = this.getHexTileOfMouseEvent(event);
          gameModel.setCellTileType(
            hexTile.row,
            hexTile.col,
            gameModel.selectedTileType
          );
        }
        if (gameModel.isEditTilesPaletteState()) {
          const hexTile = this.getHexTileOfMouseEvent(event);
          const boundingRectCoords = hexTile
            .getBoundingRect()
            .scale(this.tileW, this.tileH)
            .zoom(this.scaleFactor)
            .add(this.viewPosition);

          this.assetsLoader.createMapTile(boundingRectCoords);
        }
      },
      false
    );
  }

  getHexTileOfMouseEvent(event: MouseEvent): HexTile {
    const eventMapPosition = Point.ofRelative(event, this.origin)
      .minus(this.viewPosition)
      .inverseZoom(this.scaleFactor)
      .inverseScale(this.tileW, this.tileH);
    const hexTile = this.getHexTileFromMapPosition(eventMapPosition);
    return hexTile;
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

    this.drawHexCells(ctx);
    this.drawGrid(ctx);

    //const hoverTile = this.hoverTile;
    const hoverHex = this.hoverHex;

    if (hoverHex) {
      this.drawHex(hoverHex, ctx);
    }
  }

  private drawHexCells(ctx: CanvasRenderingContext2D) {
    const ROWS = this.state.boardModel.rows;
    const COLS = this.state.boardModel.cols;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const hexTile = new HexTile(r, c);
        this.drawHexCell(hexTile, ctx);
      }
    }
  }

  private drawHexCell(hexTile: HexTile, ctx: CanvasRenderingContext2D) {
    const cell = this.state.boardModel.getCell(hexTile.row, hexTile.col);
    if (cell.tileType) {
      this.drawHexTileTerrain(hexTile, cell.tileType, ctx);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const ROWS = this.state.boardModel.rows * 2 + 1;
    const COLS = this.state.boardModel.cols * 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = new Tile(r, c);
        this.drawGridOnTile(tile, ctx);
      }
    }
    ctx.stroke();
  }

  private drawGridOnTile(tile: Tile, ctx: CanvasRenderingContext2D) {
    const line = tile.getGridLine();
    if (line) {
      line
        .scale(this.tileW, this.tileH)
        .zoom(this.scaleFactor)
        .add(this.viewPosition)
        .drawInto(ctx);
    }
  }

  private drawHex(hexTile: HexTile, ctx: CanvasRenderingContext2D) {
    if (this.state.boardModel.gameModel.isDrawingMapState()) {
      const tt = this.state.boardModel.gameModel.selectedTileType;
      this.drawHexTileTerrain(hexTile, tt, ctx);
    } else {
      //ctx.fill(p.path());
      const p = this.getHexTilePolygonCoords(hexTile);
      ctx.save();
      ctx.clip(p.path());
      ctx.drawImage(this.assetsLoader.tileMap, 0, 0);
      ctx.restore();
    }
  }

  private drawHexTileTerrain(
    hexTile: HexTile,
    tileType: TileType,
    ctx: CanvasRenderingContext2D
  ) {
    const p = this.getHexTilePolygonCoords(hexTile);
    ctx.save();
    ctx.clip(p.path());
    const rect = hexTile
      .getBoundingRect()
      .scale(this.tileW, this.tileH)
      .zoom(this.scaleFactor)
      .add(this.viewPosition);
    ctx.drawImage(
      tileType.canvas,
      0,
      0,
      tileType.canvas.width,
      tileType.canvas.height,
      rect.upperLeft.x,
      rect.upperLeft.y,
      rect.width,
      rect.height
    );
    ctx.restore();
  }

  private getHexTilePolygonCoords(hexTile: HexTile) {
    const p = hexTile
      .getPolygon()
      .scale(this.tileW, this.tileH)
      .zoom(this.scaleFactor)
      .add(this.viewPosition);
    return p;
  }
}
