import Peer from 'peerjs';

export class MasterConnectionPeer {
  constructor() {}

  async initialize() {
    await this.waitForScript();
    var masterPeer = await this.createPeer('hexGameMaster');
    console.log('peer opened ', masterPeer.id);
    masterPeer.on('connection', function (playerConnection) {
      playerConnection.on('open', () => {
        console.log('playerConnection opened ', playerConnection.peer);
      });
      playerConnection.on('data', (data) => {
        console.log('data from player connection received', data);
      });
      playerConnection.on('close', () => {
        console.log('playerConnection closed ', playerConnection.peer);
      });
      playerConnection.on('error', () => {
        console.log('playerConnection error ', playerConnection.peer);
      });
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
