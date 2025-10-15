import React from 'react';
import ReactDOM from 'react-dom/client';

import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router';

import backend, {NetworkError} from './backend';
import app, {App} from './modules/app';
import store from './store';
import './index.css';

/* Configure backend proxy. */
backend.init(() => store.dispatch(app.actions.error(new NetworkError())));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
)
