import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { Menu, MenuService } from '../menu/services/menu.service';
import { Table, TableService } from '../table/services/table.service';
import { Order, OrderService } from '../order/services/order.service';
import { DocumentCollection } from '../shared/resources/resource';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, NgbToastModule],
  templateUrl: './pos-page.component.html',
  styleUrls: ['./pos-page.component.css'],
})
export class PosPageComponent implements OnInit {
  public tables = signal<DocumentCollection<Table> | null>(null);
  public menus = signal<DocumentCollection<Menu> | null>(null);
  public orders = signal<DocumentCollection<Order> | null>(null);
  public selectedOrder = signal<Order | null>(null);
  public showOrderModal = signal<boolean>(false);

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
    protected toastr: ToastrService
  ) {}

  public async ngOnInit() {
    Promise.allSettled([this.loadTables(), this.loadMenus(), this.loadOrders()]);
  }

  public async loadTables() {
    const data = await firstValueFrom(this.tableService.get<DocumentCollection<Table>>());
    this.tables.set(data);
  }

  public async loadMenus() {
    const data = await firstValueFrom(this.menuService.get<DocumentCollection<Menu>>());
    this.menus.set(data);
  }

  public async loadOrders() {
    try {
      const data = await firstValueFrom(this.orderService.get<DocumentCollection<Order>>());
      this.orders.set(data);
    } catch (err) {
      console.error('Error loading orders:', err);
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
      await this.loadOrders(); // Reload orders after placing new order
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
}
