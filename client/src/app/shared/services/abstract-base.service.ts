import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DocumentCollection, Resource } from '../resources/resource';

interface IBaseService<T> {
  resource: any;
  path: string;
}

export interface APIResponse {
  data: { [key: string]: any } | { [key: string]: any };
  links: string;
  message: string;
  meta: null;
  status: boolean;
}
export class ServiceRegistry {
  static registry: Map<string, any> = new Map();

  static register<T>(type: string, service: any): void {
    this.registry.set(type, service);
  }
}

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractBaseService<T> implements IBaseService<T> {
  public resource = Resource;

  public path: string = '';
  public resourceMapping: boolean = true;

  constructor(protected http: HttpClient) {}

  register() {
    if (this.resource.resourceType) {
      ServiceRegistry.register(this.resource.resourceType, this);
    } else {
      throw new Error('No resource identifier defined for the service ' + this.constructor.name);
    }
  }

  /**
   * Post a request
   */
  post(payload: any): Observable<T> {
    let _path = this.path;

    return this.http.post<T>(_path, payload);
  }

  /**
   * get a request
   */
  get<T>(query?: string): Observable<T> {
    if (query) query = `?${query}`;

    return this.http
      .get<T>(`${this.path}${query || ''}`, {})
      .pipe(map((data) => this.mapToResource(data)));
  }

  getOne<T>(id, query?: string): Observable<T> {
    if (query) query = `?${query}`;
    return this.http
      .get<T>(`${this.path}/${id}${query || ''}`, {})
      .pipe(map((data) => this.mapToResource(data)));
  }

  mapToResource(response: any) {
    const data = response;

    if (!this.resourceMapping || !this.resource) return response;
    if (Array.isArray(data)) {
      const document = new DocumentCollection(this.resource).fill(data);
      return document;
    }

    const document = new this.resource();
    document.fill(data);
    return document;
  }

  /**
   * Put request
   */
  put(path: string = '', data: any): Observable<T> {
    return this.http.put<T>(`${this.path}/${path}`, data);
  }

  /**
   * Patch request
   */
  patch(path: string = '', data: any): Observable<T> {
    return this.http.patch<T>(`${this.path}/${path}`, data);
  }

  /**
   * Delete request
   */
  delete(path: string = ''): Observable<T> {
    return this.http.delete<T>(`${this.path}/${path}`);
  }

  new() {
    if (!this.resource) throw new Error('Resource is not defined');
    return new this.resource() as T;
  }
}
