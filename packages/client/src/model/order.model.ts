export interface Order {
    status: 'SORTING' | 'READY' | 'TRANSIT' | 'DELIVERED' | 'FAILED';
}
