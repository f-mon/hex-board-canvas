import Peer from 'peerjs';

export class MasterConnectionPeer {
  constructor() {}

  async initialize() {
    await this.waitForScript();
    var peer = await this.createPeer('hexGameMaster');
    console.log('peer opened ', peer.id);
  }

  private createPeer(peerId: string): Promise<Peer> {
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
