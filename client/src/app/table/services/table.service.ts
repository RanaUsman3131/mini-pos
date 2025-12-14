import { Injectable } from '@angular/core';
import { AbstractBaseService } from '../../shared/services/abstract-base.service';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../../shared/resources/resource';

export class Table extends Resource {
  //Attributes
  public id: string = '';
  public name: string = '';
  public status: string = '';
  public capacity: number = 0;

  //  Model Properties
  public updatable: string[] = [];
  public fillable: string[] = [];
  public static resourceType = 'Table';
}

@Injectable({
  providedIn: 'root',
})
export class TableService extends AbstractBaseService<Table> {
  public resource = Table;

  public path: string = '/tables';

  constructor(protected http: HttpClient) {
    super(http);
    this.register();
  }

  public updateStatus(tableId: string, status: string) {
    return this.http.put(`${this.path}/${tableId}`, { status });
  }
}
