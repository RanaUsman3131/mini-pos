import { forOwn, get, has, includes, isEmpty, isFunction, keys, map, set } from 'lodash';
import { IResource, IResourceType } from './interfaces/resource.interface';
import { ServiceRegistry } from '../services/abstract-base.service';
import { Observable, tap } from 'rxjs';
import { cloneDeep } from 'lodash';

export function isInstanceOfAnyClass(obj: any) {
  return obj instanceof Object && obj.constructor !== Object;
}

export class Resource implements IResource<any> {
  public id: string = '';
  public name: string = '';

  public updatedAt: string = '';
  public createdAt: string = '';

  public isSaving: boolean = false;
  public isDirty: boolean = false;
  public isReadOnly: boolean = false;

  get displayLabel(): string {
    return this.name;
  }

  public updatable: string[] = [];
  public fillable: string[] = [];

  // Maximum depth allowed
  protected static MAX_DEPTH: number = 2;
  public updatedKeys: string[] = [];
  public static resourceType = '';

  protected loaded: boolean = false;

  get isLoaded(): boolean {
    return this.loaded;
  }

  public toIdentifier(): IResourceType {
    return {
      type: (this.constructor as any).resourceType,
      id: get(this, 'id', 0),
    };
  }

  constructor(depth: number = 1) {
    return new Proxy(this, {
      set: (target, key, value) => {
        if (includes(this.updatable, key)) target.updatedKeys.push(key as string);
        target[key] = value;
        return true;
      },
    });
  }

  fill(data: any) {
    for (let key of keys(data)) {
      if (!(key in this)) continue;

      if (Array.isArray(get(this, key))) {
        set(this, key, data[key]);
        continue;
      }
      if (isInstanceOfAnyClass(get(this, key)) && isFunction(get(this, key).fill)) {
        (get(this, key) as unknown as DocumentResource | DocumentCollection).fill(data[key]);
        continue;
      }

      (this as any)[key] = data[key];
    }

    this.loaded = true;

    return this;
  }

  protected getService(type?: string) {
    if (!type) {
      type = (this.constructor as any).resourceType;
    }
    if (!ServiceRegistry.registry.has(type)) throw new Error('Need to register Service');
    return ServiceRegistry.registry.get(type);
  }

  /**
   * This method is use to save the resource
   */
  save<T>(): Observable<T> {
    const payload = this.preparePayloadForUpdates();
    let observable = null;
    if (this.id) {
      observable = this.put(String(this.id), payload);
    } else {
      observable = this.post('', payload);
    }
    return observable.pipe(
      tap<T>((result) => {
        if (!isEmpty(get(result, 'data'))) {
          this.fill(get(result, 'data'));
        }
      })
    );
  }

  preparePayloadForUpdates<T extends Resource>() {
    const allowKeys = this.id ? this.updatedKeys : this.fillable;
    const payload = {};
    for (let key of allowKeys) {
      if (!(key in this)) continue;

      if (isInstanceOfAnyClass(get(this, key))) {
        if (Array.isArray(get(this, key))) {
          payload[key] = get(this, key);
          continue;
        }
        const relationship = get(this, key) as unknown as DocumentResource | DocumentCollection;
        if (relationship instanceof DocumentResource)
          if (has(relationship, 'data.id'))
            payload[relationship.relationshipKey] = (relationship.data as T).id;
        continue;
      }
      payload[key] = get(this, key);
    }
    const modifyPayload = this.transformPayload(payload);
    return modifyPayload;
  }

  transformPayload(payload) {
    return payload;
  }

  /**
   * This method is use to update the resource
   */
  put<T>(path: string, payload): Observable<T> {
    return this.getService().put(path, payload);
  }

  /**
   * This method is use to Post the resource
   */
  post<T>(path: string, payload): Observable<T> {
    return this.getService().post(path, payload);
  }

  /**
   * This method is use to update the resource
   */
  patch<T>(path: string = '', payload): Observable<T> {
    return this.getService().patch(path, payload);
  }

  /**
   * This method is use to delete the resource
   */
  delete<T>(): Observable<T> {
    return this.getService().delete(this.id);
  }

  /**
   * This method is use to fetch the resource
   */
  reload<T>(): Observable<T> {
    return this.load(this.id);
  }

  load<T>(id): Observable<T> {
    return this.getService()
      .getOne(id)
      .pipe(
        tap<T>((result) => {
          if (!isEmpty(result)) {
            Object.assign(this, result);
          }
        })
      );
  }

  /**
   * This method is use to fetch the resource
   */
  clone<T>(): T {
    return cloneDeep(this) as unknown as T;
  }
}

export class Document<R extends Resource = Resource> {
  public data?: R | R[] = null;
  public isLoading: boolean = false;
  public relationshipKey: string = null;
  public loaded: boolean = false;
  public meta?: { [key: string]: any } = {} as any;
}

export class DocumentResource<R extends Resource = Resource> extends Document<R> {
  public data?: R = null;
  fill(data_resource: any) {
    this.data.fill(data_resource);
    // for (let key of keys(data_resource)) {
    //   if (!has(this.data, key)) continue;

    //   if (isInstanceOfAnyClass(get(this.data, key))) {
    //     (get(this.data, key) as unknown as DocumentResource<R> | DocumentCollection<R>).fill(
    //       data_resource[key]
    //     );

    //     continue;
    //   }

    //   (this.data as { [ket: string]: any })[key] = data_resource[key];
    // }
    this.loaded = !isEmpty(data_resource);
    return this;
  }
  constructor(
    protected ref,
    options?: { relationshipKey?: string | number | boolean; depth?: number }
  ) {
    super();
    if (ref) this.data = new ref(get(options, 'depth'));
    if (has(options, 'relationshipKey'))
      this.relationshipKey = get(options, 'relationshipKey') as string;
  }
}
export type IPagination = {
  currentPage: number;
  path?: string;
  perPage: number;
  total: number;
  to: number;
  from: number;
  lastPage: number;
};
export class DocumentCollection<R extends Resource = Resource> extends Document<R> {
  public data?: R[] = [] as R[];
  public links?: { [key: string]: any };
  public meta?: IPagination = {
    currentPage: null,
    path: '',
    perPage: null,
    total: null,
    to: null,
    from: null,
    lastPage: null,
  } as IPagination;

  get total(): number {
    return this.meta.total ?? 0;
  }

  constructor(protected ref, options?: { relationshipKey: string | number | boolean }) {
    super();
    if (has(options, 'relationshipKey'))
      this.relationshipKey = get(options, 'relationshipKey') as string;
  }

  fill(data_resource = []) {
    this.data = [] as R[];
    for (let data of data_resource) {
      const resource: R = new this.ref();
      this.data.push(resource.fill(data));
    }

    this.loaded = !!this.data.length;
    return this;
  }

  setMeta(meta: IPagination) {
    if (isEmpty(meta)) return;
    this.meta = meta;
  }
  setLinks(links: { [key: string]: any }) {
    if (isEmpty(links)) return;
    this.links = links;
  }

  primaryKeys(): number[] {
    return map(this.data, (resource) => resource.id);
  }
}
