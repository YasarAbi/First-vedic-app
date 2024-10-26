import { Observable, Frame, alert } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';
import '@nativescript/firebase-database';

export class RegisterViewModel extends Observable {
    private _firstName: string = '';
    private _lastName: string = '';
    private _email: string = '';
    private _password: string = '';
    private _birthDate: Date = new Date();
    private _birthTime: Date = new Date();
    private _birthplaceCoords: { latitude: number; longitude: number } | null = null;
    private _birthplaceText: string = 'Henüz doğum yeri seçilmedi';

    constructor() {
        super();
    }

    // Getter ve setter metodları
    get firstName(): string { return this._firstName; }
    set firstName(value: string) {
        if (this._firstName !== value) {
            this._firstName = value;
            this.notifyPropertyChange('firstName', value);
        }
    }

    get lastName(): string { return this._lastName; }
    set lastName(value: string) {
        if (this._lastName !== value) {
            this._lastName = value;
            this.notifyPropertyChange('lastName', value);
        }
    }

    get email(): string { return this._email; }
    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string { return this._password; }
    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    get birthDate(): Date { return this._birthDate; }
    set birthDate(value: Date) {
        if (this._birthDate !== value) {
            this._birthDate = value;
            this.notifyPropertyChange('birthDate', value);
        }
    }

    get birthTime(): Date { return this._birthTime; }
    set birthTime(value: Date) {
        if (this._birthTime !== value) {
            this._birthTime = value;
            this.notifyPropertyChange('birthTime', value);
        }
    }

    get birthplaceText(): string { return this._birthplaceText; }
    set birthplaceText(value: string) {
        if (this._birthplaceText !== value) {
            this._birthplaceText = value;
            this.notifyPropertyChange('birthplaceText', value);
        }
    }

    onSelectBirthplace() {
        Frame.topmost().navigate({
            moduleName: 'pages/map/map-page',
            context: {
                onLocationSelected: (coords: { latitude: number; longitude: number }) => {
                    this._birthplaceCoords = coords;
                    this.birthplaceText = `Seçilen Konum: ${coords.latitude}, ${coords.longitude}`;
                }
            }
        });
    }

    async onRegister() {
        if (!this.validateInputs()) {
            return;
        }

        try {
            // Firebase Auth ile kullanıcı oluştur
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                this.email,
                this.password
            );

            if (userCredential.user) {
                // Kullanıcı verilerini Firebase Realtime Database'e kaydet
                await firebase.database().ref(`users/${userCredential.user.uid}`).set({
                    firstName: this.firstName,
                    lastName: this.lastName,
                    birthDate: this.birthDate.toISOString(),
                    birthTime: this.birthTime.toISOString(),
                    birthplaceCoords: this._birthplaceCoords,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });

                // Ana sayfaya yönlendir
                Frame.topmost().navigate({
                    moduleName: 'pages/main/main-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert({
                title: 'Hata',
                message: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
                okButtonText: 'Tamam'
            });
        }
    }

    private validateInputs(): boolean {
        if (!this.firstName || !this.lastName || !this.email || !this.password) {
            alert({
                title: 'Eksik Bilgi',
                message: 'Lütfen tüm zorunlu alanları doldurun.',
                okButtonText: 'Tamam'
            });
            return false;
        }

        if (!this._birthplaceCoords) {
            alert({
                title: 'Eksik Bilgi',
                message: 'Lütfen doğum yerinizi seçin.',
                okButtonText: 'Tamam'
            });
            return false;
        }

        return true;
    }
}