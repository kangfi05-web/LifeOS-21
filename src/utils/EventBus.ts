// Event Bus - Reactive Engine

import { AppEvent, EventType } from '../types';

type EventCallback = (event: AppEvent) => void;

class EventBusClass {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();
  private queue: AppEvent[] = [];
  private isProcessing = false;

  // Subscribe to event type
  subscribe(eventType: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Publish event
  publish(eventType: EventType, payload: Record<string, unknown>): void {
    const event: AppEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
    };

    this.queue.push(event);
    this.processQueue();
  }

  // Process event queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        await this.dispatchEvent(event);
      }
    }

    this.isProcessing = false;
  }

  // Dispatch event to listeners
  private async dispatchEvent(event: AppEvent): Promise<void> {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          await callback(event);
        } catch (error) {
          console.error(`Event listener error for ${event.type}:`, error);
        }
      }
    }
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
    this.queue = [];
  }

  // Get queue length (for debugging)
  getQueueLength(): number {
    return this.queue.length;
  }
}

export const eventBus = new EventBusClass();
