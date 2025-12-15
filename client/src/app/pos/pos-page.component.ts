import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbToastModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { Menu, MenuService } from '../menu/services/menu.service';
import { Table, TableService } from '../table/services/table.service';
import { Order, OrderService } from '../order/services/order.service';
import { DocumentCollection, DocumentResource } from '../shared/resources/resource';
import { firstValueFrom, skip } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FirebaseService } from '../shared/services/firebase.service';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, NgbToastModule, NgbDropdownModule],
  templateUrl: './pos-page.component.html',
  styleUrls: ['./pos-page.component.css'],
})
export class PosPageComponent implements OnInit, OnDestroy {
  public tables = signal<DocumentCollection<Table> | null>(null);
  public menus = signal<DocumentCollection<Menu> | null>(null);
  public orders = signal<DocumentCollection<Order> | null>(null);
  public selectedOrder = signal<Order | null>(null);
  public showOrderModal = signal<boolean>(false);

  public loadingTables = signal<boolean>(false);
  public loadingMenus = signal<boolean>(false);
  public loadingOrders = signal<boolean>(false);

  public cart = signal<{
    tableId: string | null;
    tableName?: string;
    items: Array<{
      menuId: string;
      menuName: string;
      qty: number;
      price?: number;
      category?: string;
    }>;
  }>({ tableId: null, items: [], tableName: '' });

  constructor(
    protected menuService: MenuService,
    protected tableService: TableService,
    protected orderService: OrderService,
    protected toastr: ToastrService,
    protected firebaseService: FirebaseService
  ) {}

  public async ngOnInit() {
    Promise.allSettled([this.loadTables(), this.loadMenus(), this.loadOrders()]);

    // Subscribe to Firebase real-time updates
    this.firebaseService.subscribeToOrders();
    this.firebaseService.subscribeToTables();
    this.firebaseService.subscribeToMenus();

    this.firebaseService.orders$.pipe(skip(1)).subscribe((changes) => {
      const currentOrders = this.orders();
      if (!currentOrders?.data) return;

      const updatedData = [...currentOrders.data];

      changes.forEach((change) => {
        const index = updatedData.findIndex((o) => o.id === change.doc.id);
        const order = new Order();
        if (change.type === 'added' && index === -1) {
          updatedData.push(order.fill(change.doc));
        } else if (change.type === 'modified' && index !== -1) {
          updatedData[index] = order.fill(change.doc);
        } else if (change.type === 'removed' && index !== -1) {
          updatedData.splice(index, 1);
        }
      });

      currentOrders.data = [...updatedData];
      this.orders.set(null);
      this.orders.set(currentOrders);
    });

    this.firebaseService.tables$.pipe(skip(1)).subscribe((changes) => {
      const currentTables = this.tables();
      if (!currentTables?.data) return;

      const updatedData = [...currentTables.data];

      changes.forEach((change) => {
        const index = updatedData.findIndex((t) => t.id === change.doc.id);
        const newTable = new Table();
        if (change.type === 'added' && index === -1) {
          updatedData.push(newTable.fill(change.doc));
        } else if (change.type === 'modified' && index !== -1) {
          updatedData[index] = newTable.fill(change.doc);
        } else if (change.type === 'removed' && index !== -1) {
          updatedData.splice(index, 1);
        }
      });
      currentTables.data = [...updatedData];

      this.tables.set(null);
      this.tables.set(currentTables);
    });

    this.firebaseService.menus$.pipe(skip(1)).subscribe((changes) => {
      const currentMenus = this.menus();
      if (!currentMenus?.data) return;

      const updatedData = [...currentMenus.data];

      changes.forEach((change) => {
        const index = updatedData.findIndex((m) => m.id === change.doc.id);
        const newMenu = new Menu();
        if (change.type === 'added' && index === -1) {
          updatedData.push(newMenu.fill(change.doc));
        } else if (change.type === 'modified' && index !== -1) {
          updatedData[index] = newMenu.fill(change.doc);
        } else if (change.type === 'removed' && index !== -1) {
          updatedData.splice(index, 1);
        }
      });
      currentMenus.data = [...updatedData];

      this.menus.set(null);
      this.menus.set(currentMenus);
    });
  }

  public ngOnDestroy() {
    this.firebaseService.unsubscribeAll();
  }

  public async loadTables() {
    this.loadingTables.set(true);
    try {
      const data = await firstValueFrom(this.tableService.get<DocumentCollection<Table>>());
      this.tables.set(data);
    } catch (err) {
      console.error('Error loading tables:', err);
      this.toastr.error('Failed to load tables');
    } finally {
      this.loadingTables.set(false);
    }
  }

  public async loadMenus() {
    this.loadingMenus.set(true);
    try {
      const data = await firstValueFrom(this.menuService.get<DocumentCollection<Menu>>());
      this.menus.set(data);
    } catch (err) {
      console.error('Error loading menus:', err);
      this.toastr.error('Failed to load menus');
    } finally {
      this.loadingMenus.set(false);
    }
  }

  public async loadOrders() {
    this.loadingOrders.set(true);
    try {
      const data = await firstValueFrom(this.orderService.get<DocumentCollection<Order>>());
      this.orders.set(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      this.toastr.error('Failed to load orders');
    } finally {
      this.loadingOrders.set(false);
    }
  }

  public selectTable(table: Table) {
    const current = this.cart();
    this.cart.set({ ...current, tableId: table.id, tableName: table.name });
  }

  public addItem(menuItem: Menu) {
    const current = this.cart();
    const idx = current.items.findIndex((ci) => ci.menuId === menuItem.id);
    if (idx >= 0) {
      current.items[idx].qty += 1;
    } else {
      current.items.push({
        menuId: menuItem.id,
        menuName: menuItem.name,
        qty: 1,
        price: menuItem.price,
        category: menuItem.category,
      });
    }
    this.cart.set({ ...current });
  }

  public increment(index: number) {
    const current = this.cart();
    current.items[index].qty += 1;
    this.cart.set({ ...current });
  }

  public decrement(index: number) {
    const current = this.cart();
    if (current.items[index].qty > 1) {
      current.items[index].qty -= 1;
      this.cart.set({ ...current });
    }
  }

  public remove(index: number) {
    const current = this.cart();
    current.items.splice(index, 1);
    this.cart.set({ ...current });
  }

  public clear() {
    this.cart.set({ tableId: '', tableName: '', items: [] });
  }

  public canPlaceOrder(): boolean {
    return !!this.cart().tableId && this.cart().items.length > 0;
  }

  public totalItems(): number {
    return this.cart().items.reduce((sum, item) => sum + item.qty, 0);
  }

  public calculateTotal(): number {
    return this.cart().items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  public async placeOrder() {
    if (!this.canPlaceOrder()) return;

    try {
      const currentCart = this.cart();
      const payload = {
        tableId: currentCart.tableId,
        tableName: currentCart.tableName,
        items: currentCart.items.map((item) => ({
          menuId: item.menuId,
          quantity: item.qty,
        })),
      };

      await firstValueFrom(this.orderService.post(payload));
      this.cart.set({ tableId: null, items: [] });

      this.toastr.success('Order placed successfully!');
    } catch (err) {
      console.error('Error placing order:', err);
      this.toastr.error('Failed to place order. Please try again.');
    }
  }

  public viewOrderDetails(order: any) {
    this.selectedOrder.set(order);
    this.showOrderModal.set(true);
  }

  public closeOrderModal() {
    this.showOrderModal.set(false);
    this.selectedOrder.set(null);
  }

  public getOrderTotal(order: any): number {
    if (!order?.items) return 0;
    return order.items.reduce((sum: number, item: any) => {
      return sum + (item.quantity || 0) * (item.price || 0);
    }, 0);
  }

  public getOrderItemsCount(order: any): number {
    if (!order?.items) return 0;
    return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  }

  public async updateTableStatus(table: Table, newStatus: string) {
    try {
      await firstValueFrom(this.tableService.updateStatus(table.id, newStatus));

      this.toastr.success(`Table status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Error updating table status:', err);
      this.toastr.error('Failed to update table status.');
    }
  }

  public async completeOrder(order: Order) {
    try {
      await firstValueFrom(order.markAsComplete());
      this.toastr.success('Order completed successfully! Table is now being released.');
      // Firebase real-time listener will automatically update the UI
    } catch (err: any) {
      console.error('Error completing order:', err);
      const errorMsg = err?.error?.error || 'Failed to complete order';
      this.toastr.error(errorMsg);
    }
  }
}
