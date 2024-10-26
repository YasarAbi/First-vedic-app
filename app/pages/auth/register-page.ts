import { EventData, Page } from '@nativescript/core';
import { RegisterViewModel } from './register-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new RegisterViewModel();
}