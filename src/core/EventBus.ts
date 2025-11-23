/**
 * Event Bus for communication between React and Phaser
 */

type EventHandler = (data: any) => void;

class EventBusClass {
  private events: Map<string, EventHandler[]> = new Map();

  emit(event: string, data?: any): void {
    const handlers = this.events.get(event) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  on(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event) || [];
    const filtered = handlers.filter((h) => h !== handler);
    this.events.set(event, filtered);
  }

  once(event: string, handler: EventHandler): void {
    const onceHandler = (data: any) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const EventBus = new EventBusClass();
