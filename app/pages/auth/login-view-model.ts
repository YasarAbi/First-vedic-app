import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';

export class LoginViewModel extends Observable {
    private _email: string = '';
    private _password: string = '';

    constructor() {
        super();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    async onLogin() {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
            if (userCredential.user) {
                // Navigate to main page
                const frame = require('@nativescript/core').Frame;
                frame.topmost().navigate({
                    moduleName: 'pages/main/main-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    }

    onRegister() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate('pages/auth/register-page');
    }
}