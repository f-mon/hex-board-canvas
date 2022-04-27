import React, { Component } from 'react';
import { render } from 'react-dom';
import { HexGame } from './view/hex-game-view';
import { HexGamePlayer } from './view/hex-game-player-view';
import './style.css';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const url = new URL(document.URL);

const root = createRoot(container);
if (url.pathname == '/player') {
  root.render(<HexGamePlayer />);
} else {
  root.render(<HexGame />);
}
