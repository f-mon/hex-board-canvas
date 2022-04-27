import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';
import { Board } from './board-view';
import { AppHeader } from './app-header-view';
import { GamePanel } from './game-panel-view';
import { MasterConnectionPeer } from '../services/master-connection-peer';

interface HexGameState {
  gameModel: GameModel;
}

export class HexGame extends Component<any, HexGameState> {
  assetsLoader: AssetsLoader;
  masterConnectionPeer: MasterConnectionPeer;

  constructor(props: any) {
    super(props);
    this.state = {
      gameModel: null,
    };
    this.assetsLoader = new AssetsLoader();
    this.assetsLoader.initialize().then(() => {
      const gameModel = GameModel.reloadFromLocalStorage(this.assetsLoader);
      this.setState({
        gameModel: gameModel,
      });
      gameModel.onUpdate().subscribe((gm) => {
        this.setState({
          gameModel: gm,
        });
      });
    });
    this.masterConnectionPeer = new MasterConnectionPeer();
    this.masterConnectionPeer.initialize();
  }

  render() {
    if (!this.assetsLoader.loaded || !this.state.gameModel) {
      return <div className="loader">Loading</div>;
    }
    return (
      <div className="hexgame">
        <AppHeader
          gameModel={this.state.gameModel}
          assetsLoader={this.assetsLoader}
          connectionPeer={this.masterConnectionPeer}
        />
        <div className="hexgame-container">
          <Board
            boardModel={this.state.gameModel.boardModel}
            assetsLoader={this.assetsLoader}
          />
          {this.state.gameModel.showGamePanel ? (
            <GamePanel
              gameModel={this.state.gameModel}
              assetsLoader={this.assetsLoader}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}
