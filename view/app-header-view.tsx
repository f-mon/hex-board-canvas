import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel, GameModel } from '../model/cell-models';
import { Cell } from './cell-view';
import { Point, Location, Tile, HexTile, Line } from '../model/geom';
import { AssetsLoader } from '../services/assets-loader';

interface AppHeaderProps {
  gameModel: GameModel;
  assetsLoader: AssetsLoader;
}
interface AppHeaderState {
  gameModel: GameModel;
  assetsLoader: AssetsLoader;
}

export class AppHeader extends Component<AppHeaderProps, AppHeaderState> {
  constructor(props: AppHeaderProps) {
    super(props);
    this.state = {
      gameModel: this.props.gameModel,
      assetsLoader: this.props.assetsLoader,
    };
    this.state.gameModel.onUpdate().subscribe((gm) => {
      this.setState({
        gameModel: gm,
        assetsLoader: this.props.assetsLoader,
      });
    });
  }

  togglePanel = () => {
    this.state.gameModel.togglePanel();
  };

  render() {
    return (
      <div className="appheader">
        <button type="button" onClick={this.togglePanel}>
          {this.state.gameModel.showGamePanel ? 'Hide Panel' : 'Show Panel'}
        </button>
      </div>
    );
  }
}
