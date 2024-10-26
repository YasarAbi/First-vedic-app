import { Application } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { firebaseConfig } from './config/firebase.config';

firebase.initializeApp(firebaseConfig)
    .then(() => {
        console.log('Firebase initialized successfully');
        Application.run({ moduleName: 'app-root' });
    })
    .catch(error => {
        console.error('Firebase initialization error:', error);
        Application.run({ moduleName: 'app-root' });
    });