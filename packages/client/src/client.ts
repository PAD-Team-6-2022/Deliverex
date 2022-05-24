import { CreateOrderDto, UpdateOrderDto } from './dto';
import qs from 'qs';
import { Order } from './model/order.model';
import fetch from 'isomorphic-unfetch';

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
    public constructor(private readonly options: Client.Options) {}

    async getOrders(options: Client.GetOrdersOptions) {
        const orders = await fetch('/orders' + qs.stringify(options));

        if (orders.status !== 200) throw new Error('Failed to get orders');

        return orders.body;
    }

    async createOrder(dto: CreateOrderDto) {
        const order = await fetch('/orders', {
            method: 'POST',
            body: JSON.stringify(dto),
        });

        if (order.status !== 200) throw new Error('Failed to create order');

        return order.body;
    }

    async getOrder(id: number) {
        const order = await fetch(`/orders/${id}`);

        if (order.status !== 200) throw new Error('Failed to get order');

        return order.body;
    }

    async updateOrder(id: number, dto: UpdateOrderDto) {
        const order = await fetch(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dto),
        });

        if (order.status !== 200) throw new Error('Failed to update order');

        return order.body;
    }

    async deleteOrder(id: number) {
        const order = await fetch(`/orders/${id}`, {
            method: 'DELETE',
        });

        if (order.status !== 200) throw new Error('Failed to delete order');

        return order.body;
    }

    getOptions(): Client.Options {
        return this.options;
    }
}
