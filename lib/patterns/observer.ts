/**
 * Observer Pattern - Head First Design Patterns
 * Allows objects to notify other objects about state changes
 */

export interface Observer {
  update(data: any): void;
}

export interface Subject {
  subscribe(observer: Observer): void;
  unsubscribe(observer: Observer): void;
  notify(data: any): void;
}

export class NotificationSubject implements Subject {
  private observers: Observer[] = [];

  subscribe(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

export class NotificationObserver implements Observer {
  constructor(
    private name: string,
    private callback: (data: any) => void
  ) {}

  update(data: any): void {
    console.log(`[${this.name}] Received notification:`, data);
    this.callback(data);
  }
}

