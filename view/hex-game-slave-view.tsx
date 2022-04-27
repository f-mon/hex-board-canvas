import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameModel, CellModel, BoardModel } from '../model/cell-models';
import { AssetsLoader } from '../services/assets-loader';
import { Board } from './board-view';
import { AppHeader } from './app-header-view';
import { GamePanel } from './game-panel-view';
import Peer from 'peerjs';

interface HexGameSlaveState {
  gameModel: GameModel;
}

export class HexGameSlave extends Component<any, HexGameSlaveState> {
  constructor(props: any) {
    super(props);
  }

  async componentDidMount() {
    await this.waitForScript();
    var peer = await this.createPeer();
    console.log('peer opened ', peer.id);
    const masterConnection = peer.connect('hexGameMaster');
    masterConnection.on('open', () => {
      console.log('masterConnection opened');
    });
    masterConnection.on('data', (data) => {
      console.log('masterConnection ondata ', data);
    });
  }

  private createPeer(): Promise<Peer> {
    return new Promise((resolve, reject) => {
      const PeerConstructor = (window as any).Peer;
      const peer = new PeerConstructor('hexGameSlave') as Peer;
      peer.on('open', (id) => {
        resolve(peer);
      });
    });
  }

  render() {
    return <div className="hexgame">Slave Mode</div>;
  }

  /**
   * Wait for the parsejs script to load on the window
   */
  private waitForScript(): Promise<void> {
    // TODO: Find a better way to load peerjs
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if ((window as any).Peer) {
          // Script ready
          clearInterval(timer);
          resolve();
        }
      }, 10);
    });
  }
}
