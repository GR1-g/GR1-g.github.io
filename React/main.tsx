import { Root, createRoot } from 'react-dom/client';
import { MapDraw } from './map.js';
import React from 'react';

export let root_text: Root;
export let root_img: Root;

async function onLoad() {
    const rootElement = document.getElementById('root');
    const rootElement2 = document.getElementById('root2');

    if (rootElement2) {
        root_text = createRoot(rootElement2);
    }

    if (rootElement) {
        let root = createRoot(rootElement);
        root.render(<MapDraw />);
    }
}

window.onload = onLoad;