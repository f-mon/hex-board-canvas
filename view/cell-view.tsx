import React, { Component } from 'react';
import { render } from 'react-dom';
import { Observable, Subject, Subscription } from 'rxjs';
import { CellModel, BoardModel } from '../model/cell-models';

interface CellProps {
  cellModel: CellModel;
}

interface CellState {
  cellModel: CellModel;
}

export class Cell extends Component<CellProps, CellState> {
  private subs: Subscription;

  constructor(props: CellProps) {
    super(props);
    const cellModel = this.props.cellModel;
    this.state = {
      cellModel: cellModel,
    };
    this.subs = cellModel.onUpdate().subscribe((cm) => {
      this.setState({
        cellModel: cm,
      });
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.subs.unsubscribe();
  }

  cellActivate = () => '';
  cellDeactivate = () => '';
  cellClick = () => {
    console.log(
      'cell click ',
      this.state.cellModel.row,
      this.state.cellModel.col
    );
    //this.state.cellModel.activate();
    this.state.cellModel.boardMode.toggleSelected(this.state.cellModel);
  };

  render() {
    return (
      <div
        className={
          'cellOuter row_' +
          this.state.cellModel.row +
          ' col_' +
          this.state.cellModel.col +
          (this.state.cellModel.isOddCell() ? ' odd ' : '') +
          (this.state.cellModel.isSelectedCell() ? ' selected ' : '') +
          (this.state.cellModel.active ? ' activated ' : '')
        }
      >
        <div
          className="cell"
          style={{
            backgroundColor: this.state.cellModel.backgroundColor,
          }}
          onMouseEnter={this.cellActivate}
          onMouseLeave={this.cellDeactivate}
          onClick={this.cellClick}
        ></div>
      </div>
    );
  }
}
