import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  CellModel,
  BoardModel,
  GameModel,
  TileType,
} from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';

interface GamePanelState {
  gameModel: GameModel;
}

export class GamePanel extends Component<any, GamePanelState> {
  assetsLoader: AssetsLoader;

  constructor(props: any) {
    super(props);
    const gameModel: GameModel = this.props.gameModel;
    this.state = {
      gameModel: gameModel,
    };
    gameModel.onUpdate().subscribe((gm: GameModel) => {
      this.setState({
        gameModel: gm,
      });
    });
    this.assetsLoader = this.props.assetsLoader;
    this.assetsLoader.onUpdate().subscribe(() => {
      this.setState({
        gameModel: this.state.gameModel,
      });
    });
  }

  clearSelection = () => {
    this.state.gameModel.boardModel.clearSelection();
  };

  colorVal: string;
  setSelectionColor = (colorVal: string) => {
    this.colorVal = colorVal;
  };

  render() {
    const boardModel = this.state.gameModel.boardModel;
    return (
      <div className="gamePanel">
        <div>
          {boardModel.rows} Rows X {boardModel.cols} Cols
        </div>
        <div>
          Selected:<b>{boardModel.selection.size}</b>
          <button onClick={this.clearSelection}>Clear Selection</button>
        </div>

        <div className="tiles-list">
          {this.assetsLoader.tiles.map((c) => this.renderTileDiv(c))}
        </div>
      </div>
    );
  }

  toggleSelectTile(tileType: TileType) {
    if (this.state.gameModel.isSelectedTileType(tileType)) {
      this.state.gameModel.selectTileType(null);
    } else {
      this.state.gameModel.selectTileType(tileType);
    }
    this.setState(this.state);
  }

  deleteTile(tileType: TileType, event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.assetsLoader.deleteTileType(tileType);
  }

  renderTileDiv(tileImage: TileType) {
    const src = tileImage.canvas.toDataURL();
    const isSelected = this.state.gameModel.isSelectedTileType(tileImage);
    return (
      <div
        className={'tile-thumbnail ' + (isSelected ? 'selected ' : '')}
        onClick={() => this.toggleSelectTile(tileImage)}
        key={tileImage.name}
      >
        <img
          width={this.state.gameModel.boardModel.hexW * 2.5}
          height={this.state.gameModel.boardModel.hexH * 2.5}
          src={src}
          title={tileImage.name}
        />
        {isSelected ? (
          <div>
            <button
              type="button"
              onClick={(event) => this.deleteTile(tileImage, event)}
            >
              Delete
            </button>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
