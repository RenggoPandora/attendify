import { route as ziggyRoute } from 'ziggy-js';

declare global {
    function route(name?: string, params?: any, absolute?: boolean): string;
    var Ziggy: any;
}

export {};
