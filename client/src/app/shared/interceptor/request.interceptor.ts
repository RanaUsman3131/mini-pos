import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

import { replace } from 'lodash';

declare global {
  interface Window {
    EXPORTMODE?: string | boolean; // You can adjust the type if you know it's always a string or another type.
    EXPORTH_HEADER_VALUE?: string;
  }
}

export function requestInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const headers: { [key: string]: string } = {};

  headers['Accept'] = 'application/json';

  const baseRequest = req.clone({ withCredentials: true, setHeaders: headers });

  window.EXPORTMODE = false;

  if (!req.url.startsWith('http')) {
    const baseUrl = replace('http://localhost:8000', /\/+$/, ''); // Remove trailing slashes
    const requestUrl = replace(req.url, /^\/+/, '');

    return next(
      baseRequest.clone({
        url: `${baseUrl}/${requestUrl}`,
      })
    );
  }
  return next(baseRequest);
}
