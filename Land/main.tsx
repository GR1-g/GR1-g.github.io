import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import { init, CreateUI } from './render/render.js';

export let root_ui: Root;

async function onLoad() {
    const rootElement = document.getElementById('root');
    const rootElement2 = document.getElementById('root_ui');

    if (rootElement) {
        let root = createRoot(rootElement);
        root.render(<canvas id="glcanvas" ref={init} width="500" height="500"></canvas>);
    }

    if (rootElement2) {
        root_ui = createRoot(rootElement2);
        root_ui.render(<CreateUI />);
    }
}

window.onload = onLoad;