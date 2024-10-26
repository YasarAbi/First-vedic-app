import { Observable, Frame } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';
import '@nativescript/firebase-database';
import '@nativescript/firebase-storage';
import * as imagepicker from '@nativescript/imagepicker';

export class ProfileViewModel extends Observable {
    private _profileImage: string = '~/images/default-profile.png';
    private _fullName: string = '';
    private _email: string = '';
    private _birthDate: string = '';
    private _birthTime: string = '';
    private _birthPlace: string = '';

    constructor() {
        super();
        this.loadUserData();
    }

    get profileImage(): string { return this._profileImage; }
    set profileImage(value: string) {
        if (this._profileImage !== value) {
            this._profileImage = value;
            this.notifyPropertyChange('profileImage', value);
        }
    }

    get fullName(): string { return this._fullName; }
    set fullName(value: string) {
        if (this._fullName !== value) {
            this._fullName = value;
            this.notifyPropertyChange('fullName', value);
        }
    }

    get email(): string { return this._email; }
    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get birthDate(): string { return this._birthDate; }
    set birthDate(value: string) {
        if (this._birthDate !== value) {
            this._birthDate = value;
            this.notifyPropertyChange('birthDate', value);
        }
    }

    get birthTime(): string { return this._birthTime; }
    set birthTime(value: string) {
        if (this._birthTime !== value) {
            this._birthTime = value;
            this.notifyPropertyChange('birthTime', value);
        }
    }

    get birthPlace(): string { return this._birthPlace; }
    set birthPlace(value: string) {
        if (this._birthPlace !== value) {
            this._birthPlace = value;
            this.notifyPropertyChange('birthPlace', value);
        }
    }

    async loadUserData() {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            this.email = currentUser.email;

            try {
                const snapshot = await firebase.database()
                    .ref(`users/${currentUser.uid}`)
                    .once('value');
                const userData = snapshot.val();

                this.fullName = `${userData.firstName} ${userData.lastName}`;
                this.birthDate = new Date(userData.birthDate).toLocaleDateString('tr-TR');
                this.birthTime = new Date(userData.birthTime).toLocaleTimeString('tr-TR');
                this.birthPlace = `${userData.birthplaceCoords.latitude}, ${userData.birthplaceCoords.longitude}`;

                if (userData.profileImage) {
                    this.profileImage = userData.profileImage;
                }
            } catch (error) {
                console.error('Kullanıcı verisi yükleme hatası:', error);
            }
        }
    }

    async onChangePhoto() {
        try {
            const context = imagepicker.create({
                mode: 'single'
            });

            const selection = await context.present();
            if (selection.length > 0) {
                const imageAsset = selection[0];
                const currentUser = firebase.auth().currentUser;

                if (currentUser) {
                    // Firebase Storage'a yükle
                    const imagePath = `profile_images/${currentUser.uid}.jpg`;
                    const reference = firebase.storage().ref(imagePath);
                    await reference.putFile(imageAsset.android || imageAsset.ios);

                    // Download URL al
                    const downloadURL = await reference.getDownloadURL();

                    // Profil resmini güncelle
                    await firebase.database()
                        .ref(`users/${currentUser.uid}/profileImage`)
                        .set(downloadURL);

                    this.profileImage = downloadURL;
                }
            }
        } catch (error) {
            console.error('Fotoğraf yükleme hatası:', error);
            alert('Fotoğraf yüklenirken bir hata oluştu.');
        }
    }

    async onLogout() {
        try {
            await firebase.auth().signOut();
            Frame.topmost().navigate({
                moduleName: 'pages/auth/login-page',
                clearHistory: true
            });
        } catch (error) {
            console.error('Çıkış hatası:', error);
            alert('Çıkış yapılırken bir hata oluştu.');
        }
    }
}