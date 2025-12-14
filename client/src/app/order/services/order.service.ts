import { Injectable } from '@angular/core';
import { AbstractBaseService } from '../../shared/services/abstract-base.service';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../../shared/resources/resource';

export class Order extends Resource {
  //Attributes
  public id: string = '';
  public tableId: string = '';
  public tableName: string = '';
  public status: string = '';
  public failureReason: string = '';

  public items: Array<{
    lineTotal: number;
    menuId: string;
    menuName: string;
    price: number;
    quantity: number;
  }> = [];

  //Relationships

  //  Model Properties
  public updatable: string[] = [];
  public fillable: string[] = [];
  public static resourceType = 'Order';
}

@Injectable({
  providedIn: 'root',
})
export class OrderService extends AbstractBaseService<Order> {
  public resource = Order;

  public path: string = '/orders';

  constructor(protected http: HttpClient) {
    super(http);
    this.register();
  }
}
