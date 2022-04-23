import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel } from '../model/cell-models';
import { Cell } from './cell-view';
import { Point, Location, Tile, HexTile, Line } from '../model/geom';
import { AssetsLoader } from '../services/assets-loader';

interface AppHeaderProps {
  boardModel: BoardModel;
  assetsLoader: AssetsLoader;
}
interface AppHeaderState {}

export class AppHeader extends Component<AppHeaderProps, AppHeaderState> {
  render() {
    return <div className="appheader">HexMap</div>;
  }
}
