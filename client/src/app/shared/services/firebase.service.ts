import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

export interface FirestoreChange<T = any> {
  type: 'added' | 'modified' | 'removed';
  doc: T;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private firestore: Firestore;
  private ordersSubject = new Subject<FirestoreChange[]>();
  private tablesSubject = new Subject<FirestoreChange[]>();
  private menusSubject = new Subject<FirestoreChange[]>();

  public orders$ = this.ordersSubject.asObservable();
  public tables$ = this.tablesSubject.asObservable();
  public menus$ = this.menusSubject.asObservable();

  private ordersUnsubscribe: Unsubscribe | null = null;
  private tablesUnsubscribe: Unsubscribe | null = null;
  private menusUnsubscribe: Unsubscribe | null = null;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.firestore = getFirestore(this.app);
  }

  public subscribeToOrders(): void {
    if (this.ordersUnsubscribe) {
      return; // Already subscribed
    }

    const ordersCollection = collection(this.firestore, 'orders');
    const ordersQuery = query(ordersCollection);

    this.ordersUnsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const changes: FirestoreChange[] = snapshot.docChanges().map((change) => ({
          type: change.type,
          doc: {
            id: change.doc.id,
            ...change.doc.data(),
          },
        }));
        if (changes.length > 0) {
          this.ordersSubject.next(changes);
        }
      },
      (error) => {
        console.error('Error listening to orders:', error);
      }
    );
  }

  public subscribeToTables(): void {
    if (this.tablesUnsubscribe) {
      return; // Already subscribed
    }

    const tablesCollection = collection(this.firestore, 'tables');
    const tablesQuery = query(tablesCollection);

    this.tablesUnsubscribe = onSnapshot(
      tablesQuery,
      (snapshot) => {
        const changes: FirestoreChange[] = snapshot.docChanges().map((change) => ({
          type: change.type,
          doc: {
            id: change.doc.id,
            ...change.doc.data(),
          },
        }));
        if (changes.length > 0) {
          this.tablesSubject.next(changes);
        }
      },
      (error) => {
        console.error('Error listening to tables:', error);
      }
    );
  }

  public subscribeToMenus(): void {
    if (this.menusUnsubscribe) {
      return; // Already subscribed
    }

    const menusCollection = collection(this.firestore, 'menu_items');
    const menusQuery = query(menusCollection);

    this.menusUnsubscribe = onSnapshot(
      menusQuery,
      (snapshot) => {
        const changes: FirestoreChange[] = snapshot.docChanges().map((change) => ({
          type: change.type,
          doc: {
            id: change.doc.id,
            ...change.doc.data(),
          },
        }));
        if (changes.length > 0) {
          this.menusSubject.next(changes);
        }
      },
      (error) => {
        console.error('Error listening to menus:', error);
      }
    );
  }

  public unsubscribeFromOrders(): void {
    if (this.ordersUnsubscribe) {
      this.ordersUnsubscribe();
      this.ordersUnsubscribe = null;
    }
  }

  public unsubscribeFromTables(): void {
    if (this.tablesUnsubscribe) {
      this.tablesUnsubscribe();
      this.tablesUnsubscribe = null;
    }
  }

  public unsubscribeFromMenus(): void {
    if (this.menusUnsubscribe) {
      this.menusUnsubscribe();
      this.menusUnsubscribe = null;
    }
  }

  public unsubscribeAll(): void {
    this.unsubscribeFromOrders();
    this.unsubscribeFromTables();
    this.unsubscribeFromMenus();
  }
}
