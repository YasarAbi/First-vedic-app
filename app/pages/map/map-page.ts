import { EventData, Page } from '@nativescript/core';
import { MapViewModel } from './map-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    const context = page.navigationContext;
    page.bindingContext = new MapViewModel(context);
}