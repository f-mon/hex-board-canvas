import React, { Component } from 'react';
import { render } from 'react-dom';
import { HexGame } from './view/hex-game-view';
import { HexGameSlave } from './view/hex-game-slave-view';
import './style.css';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const url = new URL(document.URL);

const root = createRoot(container);
if (url.pathname == '/player') {
  root.render(<HexGameSlave />);
} else {
  root.render(<HexGame />);
}
