import Peer from 'peerjs';

export class PlayerConnectionPeer {
  constructor() {}

  async initialize() {
    await this.waitForScript();
    const playerId =
      new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
    var peer = await this.createPeer('hexPlayer_' + playerId);
    console.log('peer opened ', peer.id);

    const masterConnection = peer.connect('hexGameMaster');
    masterConnection.on('open', () => {
      console.log('masterConnection opened');
      masterConnection.send("pippo message");
    });
    masterConnection.on('data', (data) => {
      console.log('masterConnection data ', data);
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
