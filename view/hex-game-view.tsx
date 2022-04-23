import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';
import { Board } from './board-view';
import { AppHeader } from './app-header-view';
import { GamePanel } from './game-panel-view';

interface HexGameState {
  gameModel: GameModel;
}

export class HexGame extends Component<any, HexGameState> {
  assetsLoader: AssetsLoader;

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
    this.assetsLoader = new AssetsLoader();
    this.assetsLoader.initialize().then(() => {
      this.setState(this.state);
    });
  }

  componentDidMount() {
    this.state.gameModel.reloadState();
  }

  render() {
    if (!this.assetsLoader.loaded) {
      return <div className="loader">Loading</div>;
    }
    return (
      <div className="hexgame">
        <AppHeader />
        <div className="hexgame-container">
          <Board
            boardModel={this.state.gameModel.boardModel}
            assetsLoader={this.assetsLoader}
          />
          <GamePanel
            gameModel={this.state.gameModel}
            assetsLoader={this.assetsLoader}
          />
        </div>
      </div>
    );
  }
}
