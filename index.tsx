import React, { Component } from 'react';
import { render } from 'react-dom';
import { HexGame } from './view/hex-game-view';
import './style.css';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<HexGame />);
