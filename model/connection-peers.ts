import { Observable, Subject, Subscription } from 'rxjs';

export type ConnectionStatus = 'NOT_CONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface ConnectionPeer {
  readonly $status: Observable<ConnectionStatus>;
}
