export interface CreateOrderDto {
  email: string;
  country: string;
  postalCode: string;
  city: string;
  street: string;
  houseNumber: string;
  weight: number;
  sizeFormat: number;
}
