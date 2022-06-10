import { Order } from './model/order.model';
import OrderDAO from './dao/order.dao';

export namespace Client {
    export type Options = {
        token: string;
        host: string;
    };

    export type PaginationOptions = {
        limit?: number;
        offset?: number;
    };

    export type GetOrdersOptions = Pick<Order, 'status'> & PaginationOptions;
}

export class Client {
    public order: OrderDAO;

    public constructor(public readonly options: Client.Options) {
        this.order = new OrderDAO();
    }
}
