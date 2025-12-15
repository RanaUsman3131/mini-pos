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

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private firestore: Firestore;
  private ordersSubject = new Subject<any[]>();
  private tablesSubject = new Subject<any[]>();

  public orders$ = this.ordersSubject.asObservable();
  public tables$ = this.tablesSubject.asObservable();

  private ordersUnsubscribe: Unsubscribe | null = null;
  private tablesUnsubscribe: Unsubscribe | null = null;

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
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.ordersSubject.next(orders);
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
        const tables = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.tablesSubject.next(tables);
      },
      (error) => {
        console.error('Error listening to tables:', error);
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

  public unsubscribeAll(): void {
    this.unsubscribeFromOrders();
    this.unsubscribeFromTables();
  }
}
