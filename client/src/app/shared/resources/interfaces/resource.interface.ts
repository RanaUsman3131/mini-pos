import { Observable } from 'rxjs';

export interface IResourceType {
  type: string;
  id: number;
}

export interface IResource<T> {
  /**
   * Resource Properties
   */

  toIdentifier(): IResourceType;
  /**
   * This method is use to save the resource
   */
  save<T>(): Observable<T>;

  post<T>(id, payload): Observable<T>;
  /**
   * This method is use to update the resource
   */
  put<T>(id, payload): Observable<T>;

  /**
   * This method is use to update the resource
   */
  patch<T>(path, payload): Observable<T>;

  /**
   * This method is use to delete the resource
   */
  delete<T>(): Observable<T>;

  /**
   * This method is use to fetch the resource
   */
  reload<T>(): Observable<T>;

  /**
   * This method is use to fetch the resource
   */
  load<T>(id: number): Observable<T>;

  /**
   * This method is use to fetch the resource
   */
  clone<T>(): T;
}
