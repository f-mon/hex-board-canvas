import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';
import { Board } from './board-view';
import { AppHeader } from './app-header-view';
import { GamePanel } from './game-panel-view';
import { PlayerConnectionPeer } from '../services/player-connection-peer';

interface HexGameSlaveState {
  gameModel: GameModel;
}

export class HexGameSlave extends Component<any, HexGameSlaveState> {
  constructor(props: any) {
    super(props);
    const playerConnectionPeer = new PlayerConnectionPeer();
    playerConnectionPeer.initialize();
  }

  render() {
    return <div className="hexgame">Slave Mode</div>;
  }
}
