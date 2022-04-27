import Peer from 'peerjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConnectionStatus } from '../model/connection-peers';
import { ConnectionPeer } from '../model/connection-peers';

export class MasterConnectionPeer implements ConnectionPeer {
  private masterPeer: Peer;
  private playersConnections: Peer.DataConnection[] = [];
  private status: Subject<ConnectionStatus> = new BehaviorSubject(
    'NOT_CONNECTED'
  );

  constructor() {}

  async initialize() {
    await this.waitForScript();
    this.masterPeer = await this.createPeer('hexGameMaster');
    console.log('peer opened ', this.masterPeer.id);
    this.masterPeer.on('connection', (playerConnection) => {
      this.trackConnectedPlayer(playerConnection);
    });
  }

  get $status(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  private trackConnectedPlayer(playerConnection: Peer.DataConnection) {
    playerConnection.on('open', () => {
      console.log('playerConnection opened ', playerConnection.peer);
      this.playersConnections.push(playerConnection);
    });
    playerConnection.on('data', (data) => {
      console.log('data from player connection received', data);
    });
    playerConnection.on('close', () => {
      console.log('playerConnection closed ', playerConnection.peer);
      const idx = this.playersConnections.indexOf(playerConnection);
      if (idx >= 0) {
        this.playersConnections.splice(idx, 1);
      }
    });
    playerConnection.on('error', () => {
      console.log('playerConnection error ', playerConnection.peer);
    });
  }

  private createPeer(peerId: string): Promise<Peer> {
    console.log('create peer  ', peerId);
    return new Promise((resolve, reject) => {
      const PeerConstructor = (window as any).Peer;
      const peer = new PeerConstructor(peerId) as Peer;
      peer.on('open', (id) => {
        resolve(peer);
      });
    });
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
