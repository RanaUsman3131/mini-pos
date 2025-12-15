import { Injectable } from '@angular/core';
import { AbstractBaseService } from '../../shared/services/abstract-base.service';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../../shared/resources/resource';

export class Menu extends Resource {
  //Attributes
  public id: string = null;
  public name: string = '';
  public category: string = '';
  public price: number = 0;
  public total_stock: number = 0;
  public remaining_stock: number = 0;

  //Relationships

  //  Model Properties
  public updatable: string[] = [];
  public fillable: string[] = [];
  public static resourceType = 'Menu';
}

@Injectable({
  providedIn: 'root',
})
export class MenuService extends AbstractBaseService<Menu> {
  public resource = Menu;

  public path: string = '/menus';

  constructor(protected http: HttpClient) {
    super(http);
    this.register();
  }
}
