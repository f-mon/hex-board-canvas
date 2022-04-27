import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';
import { Board } from './board-view';
import { AppHeader } from './app-header-view';
import { GamePanel } from './game-panel-view';
import { PlayerConnectionPeer } from '../services/player-connection-peer';

interface HexGamePlayerState {
  gameModel: GameModel;
}

export class HexGamePlayer extends Component<any, HexGamePlayerState> {

  private playerConnectionPeer: PlayerConnectionPeer;

  constructor(props: any) {
    super(props);
    this.playerConnectionPeer = new PlayerConnectionPeer();
    this.playerConnectionPeer.initialize();
  }

  render() {
    return (
      <div className="hexgame">
        <AppHeader
          gameModel={this.state.gameModel}
          connectionPeer={this.playerConnectionPeer}
        />
        <div className="hexgame-container">
        </div>
      </div>
    );
  }
}
