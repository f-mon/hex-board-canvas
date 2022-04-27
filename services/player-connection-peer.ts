import Peer from 'peerjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConnectionPeer, ConnectionStatus } from '../model/connection-peers';

export class PlayerConnectionPeer implements ConnectionPeer {
  private peer: Peer;
  private status: Subject<ConnectionStatus> = new BehaviorSubject(
    'NOT_CONNECTED'
  );
  private masterConnection: Peer.DataConnection;

  constructor() {}

  get $status(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  async initialize() {
    await this.waitForScript();
    const playerId =
      new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
    this.peer = await this.createPeer('hexPlayer_' + playerId);
    console.log('peer opened ', this.peer.id);
    this.tryConnectToMaster('hexGameMaster');
  }

  private tryConnectToMaster(masterPeerId: string) {
    const masterConnection = this.peer.connect(masterPeerId);
    this.status.next('CONNECTING');
    masterConnection.on('open', () => {
      this.status.next('CONNECTED');
      console.log('masterConnection opened');
      this.masterConnection = masterConnection;
      masterConnection.send('pippo message');
    });
    masterConnection.on('data', (data) => {
      console.log('masterConnection data ', data);
    });
    masterConnection.on('close', () => {
      this.status.next('NOT_CONNECTED');
      console.log('masterConnection closed ');
      this.masterConnection = null;
      setTimeout(() => this.tryConnectToMaster(masterPeerId), 2000);
    });
    masterConnection.on('error', () => {
      console.log('masterConnection error ');
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
