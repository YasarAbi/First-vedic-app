import { Observable, Frame } from '@nativescript/core';
import { Marker } from '@nativescript/google-maps';

export class MapViewModel extends Observable {
    private _latitude: number = 41.0082; // İstanbul
    private _longitude: number = 28.9784;
    private _zoom: number = 8;
    private _selectedMarker: Marker | null = null;
    private _onLocationSelected: Function;

    constructor(context: any) {
        super();
        this._onLocationSelected = context.onLocationSelected;
    }

    get latitude(): number { return this._latitude; }
    set latitude(value: number) {
        if (this._latitude !== value) {
            this._latitude = value;
            this.notifyPropertyChange('latitude', value);
        }
    }

    get longitude(): number { return this._longitude; }
    set longitude(value: number) {
        if (this._longitude !== value) {
            this._longitude = value;
            this.notifyPropertyChange('longitude', value);
        }
    }

    get zoom(): number { return this._zoom; }
    set zoom(value: number) {
        if (this._zoom !== value) {
            this._zoom = value;
            this.notifyPropertyChange('zoom', value);
        }
    }

    onMapReady(args: any) {
        const mapView = args.object;
        // İlk marker'ı ekle
        this.addMarker(mapView, this.latitude, this.longitude);
    }

    onMapTap(args: any) {
        const mapView = args.object;
        const position = args.position;
        
        // Önceki marker'ı kaldır
        if (this._selectedMarker) {
            mapView.removeMarker(this._selectedMarker);
        }

        // Yeni marker ekle
        this.addMarker(mapView, position.latitude, position.longitude);
        
        // Koordinatları güncelle
        this.latitude = position.latitude;
        this.longitude = position.longitude;
    }

    private addMarker(mapView: any, lat: number, lng: number) {
        this._selectedMarker = new Marker({
            position: {
                latitude: lat,
                longitude: lng
            },
            title: 'Seçilen Konum',
            snippet: `${lat}, ${lng}`,
            draggable: true
        });
        mapView.addMarker(this._selectedMarker);
    }

    onConfirmLocation() {
        if (this._onLocationSelected) {
            this._onLocationSelected({
                latitude: this.latitude,
                longitude: this.longitude
            });
        }
        Frame.topmost().goBack();
    }
}