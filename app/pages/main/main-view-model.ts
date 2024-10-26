import { Observable, Frame } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';
import '@nativescript/firebase-database';
import { ChatGPTAPI } from 'nativescript-chatgpt';

interface ChatMessage {
    message: string;
    isUser: boolean;
    timestamp: number;
}

export class MainViewModel extends Observable {
    private _messageText: string = '';
    private _chatMessages: Array<ChatMessage> = [];
    private _welcomeMessage: string = 'Yükleniyor...';
    private _userData: any = null;
    private _chatGPT: ChatGPTAPI;

    constructor() {
        super();
        this._chatGPT = new ChatGPTAPI({
            apiKey: 'your-api-key-here'
        });
        this.loadUserData();
        this.initializeChat();
    }

    get messageText(): string {
        return this._messageText;
    }

    set messageText(value: string) {
        if (this._messageText !== value) {
            this._messageText = value;
            this.notifyPropertyChange('messageText', value);
        }
    }

    get chatMessages(): Array<ChatMessage> {
        return this._chatMessages;
    }

    set chatMessages(value: Array<ChatMessage>) {
        if (this._chatMessages !== value) {
            this._chatMessages = value;
            this.notifyPropertyChange('chatMessages', value);
        }
    }

    get welcomeMessage(): string {
        return this._welcomeMessage;
    }

    set welcomeMessage(value: string) {
        if (this._welcomeMessage !== value) {
            this._welcomeMessage = value;
            this.notifyPropertyChange('welcomeMessage', value);
        }
    }

    async loadUserData() {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            try {
                const snapshot = await firebase.database()
                    .ref(`users/${currentUser.uid}`)
                    .once('value');
                this._userData = snapshot.val();
                this.welcomeMessage = `Merhaba ${this._userData.firstName}! Doğum haritanız hakkında merak ettiklerinizi sorabilirsiniz.`;
            } catch (error) {
                console.error('Kullanıcı verisi yükleme hatası:', error);
            }
        }
    }

    private initializeChat() {
        this.chatMessages = [{
            message: 'Merhaba! Ben sizin kişisel astroloji asistanınızım. Doğum haritanız hakkında her türlü soruyu yanıtlayabilirim.',
            isUser: false,
            timestamp: Date.now()
        }];
    }

    async sendMessage() {
        if (!this.messageText.trim()) return;

        const userMessage = this.messageText.trim();
        this.messageText = ''; // Input'u temizle

        // Kullanıcı mesajını ekle
        this.chatMessages = [...this.chatMessages, {
            message: userMessage,
            isUser: true,
            timestamp: Date.now()
        }];

        try {
            // Astrolojik verileri hazırla
            const astroContext = `
                Doğum Tarihi: ${new Date(this._userData.birthDate).toLocaleDateString('tr-TR')}
                Doğum Saati: ${new Date(this._userData.birthTime).toLocaleTimeString('tr-TR')}
                Doğum Yeri Koordinatları: ${this._userData.birthplaceCoords.latitude}, ${this._userData.birthplaceCoords.longitude}
            `;

            // ChatGPT'ye gönderilecek prompt'u hazırla
            const prompt = `Sen bir Vedik astroloji uzmanısın. Aşağıdaki doğum bilgilerine göre soruyu yanıtla:
                ${astroContext}
                
                Soru: ${userMessage}`;

            // ChatGPT'den yanıt al
            const response = await this._chatGPT.sendMessage(prompt);

            // Asistan yanıtını ekle
            this.chatMessages = [...this.chatMessages, {
                message: response.text,
                isUser: false,
                timestamp: Date.now()
            }];
        } catch (error) {
            console.error('ChatGPT yanıt hatası:', error);
            // Hata mesajını ekle
            this.chatMessages = [...this.chatMessages, {
                message: 'Üzgünüm, yanıt verirken bir hata oluştu. Lütfen tekrar deneyin.',
                isUser: false,
                timestamp: Date.now()
            }];
        }
    }

    onProfile() {
        Frame.topmost().navigate('pages/profile/profile-page');
    }
}