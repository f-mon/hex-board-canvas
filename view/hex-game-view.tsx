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
    this.state = {
      gameModel: null,
    };
    this.assetsLoader = new AssetsLoader();
    this.assetsLoader.initialize().then(() => {
      const gameModel = GameModel.reloadFromLocalStorage();
      this.setState({
        gameModel: gameModel,
      });
    });
  }

  render() {
    if (!this.assetsLoader.loaded || !this.state.gameModel) {
      return <div className="loader">Loading</div>;
    }
    return (
      <div className="hexgame">
        <AppHeader
          boardModel={this.state.gameModel.boardModel}
          assetsLoader={this.assetsLoader}
        />
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
