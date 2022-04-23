import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel, GameModel } from '../model/cell-models';
import { AssetsLoader, TileImage } from '../services/assets-loader';

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
    this.state.gameModel.boardModel.clearCelection();
  };

  onStartStopClick = () => {
    console.log('onStartStopClick');
    if (!this.state.gameModel.running) {
      this.state.gameModel.start();
    } else {
      this.state.gameModel.stop();
    }
  };

  applySelectionColor = () => {
    this.state.gameModel.boardModel.selection.forEach((cell) => {
      cell.backgroundColor = this.colorVal;
      cell.notifyChanged();
    });
  };

  colorVal: string;
  setSelectionColor = (colorVal: string) => {
    this.colorVal = colorVal;
  };

  onSave = () => {
    this.state.gameModel.exportAndSaveState();
  };

  onReLoad = () => {
    this.state.gameModel.reloadState();
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

  renderTileDiv(tileImage: TileImage) {
    const src = tileImage.canvas.toDataURL();
    return (
      <div className="tile-thumbnail" key={tileImage.tileName}>
        <img
          width={this.state.gameModel.boardModel.hexW * 2.5}
          height={this.state.gameModel.boardModel.hexH * 2.5}
          src={src}
          title={tileImage.tileName}
        />
      </div>
    );
  }
}
