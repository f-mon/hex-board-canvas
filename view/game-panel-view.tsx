import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel, GameModel } from '../model/cell-models';

interface GamePanelState {
  gameModel: GameModel;
}

export class GamePanel extends Component<any, GamePanelState> {
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
        <div>{this.state.gameModel.turn}</div>
        <div>
          <button onClick={this.onStartStopClick}>Start/Stop</button>
        </div>
        <div>
          Color:{' '}
          <input
            type="color"
            onChange={(e) => this.setSelectionColor(e.target.value)}
          ></input>
          <button onClick={this.applySelectionColor}>Apply Color</button>
        </div>
        <div>
          <button onClick={this.onSave}>Save</button>
        </div>
        <div>
          <button onClick={this.onReLoad}>ReLoad</button>
        </div>
      </div>
    );
  }
}
