import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { Board } from './board-view';
import { GamePanel } from './game-panel-view';

interface HexGameState {
  gameModel: GameModel;
}

export class HexGame extends Component<any, HexGameState> {
  constructor(props: any) {
    super(props);
    const gameModel = new GameModel(
      this.props.speed,
      this.props.rows,
      this.props.cols
    );
    this.state = {
      gameModel: gameModel,
    };
  }

  componentDidMount() {
    this.state.gameModel.reloadState();
  }

  render() {
    return (
      <div className="hexgame">
        <Board boardModel={this.state.gameModel.boardModel} />
        {/*<GamePanel gameModel={this.state.gameModel} />*/}
      </div>
    );
  }
}
