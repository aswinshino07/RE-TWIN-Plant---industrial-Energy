export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: string;
  qos?: number;
}

export type MqttHandler = (topic: string, payload: any) => void;

class MqttService {
  private subscribers: Map<string, Set<MqttHandler>> = new Map();
  private messageBuffer: MqttMessage[] = [];
  private maxBufferSize = 500;
  private connected = true;

  constructor() {
    // Virtual internal broker
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public subscribe(topicPattern: string, handler: MqttHandler): () => void {
    if (!this.subscribers.has(topicPattern)) {
      this.subscribers.set(topicPattern, new Set());
    }
    this.subscribers.get(topicPattern)!.add(handler);

    return () => {
      const handlers = this.subscribers.get(topicPattern);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(topicPattern);
        }
      }
    };
  }

  public publish(topic: string, payload: any): void {
    const msg: MqttMessage = {
      topic,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.messageBuffer.unshift(msg);
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer.pop();
    }

    // Match subscribers (supports direct string and simple wildcard '#')
    for (const [pattern, handlers] of this.subscribers.entries()) {
      if (this.topicMatches(pattern, topic)) {
        handlers.forEach((h) => {
          try {
            h(topic, payload);
          } catch (err) {
            console.error(`Error in MQTT handler for topic ${topic}:`, err);
          }
        });
      }
    }
  }

  public getRecentMessages(limit = 50): MqttMessage[] {
    return this.messageBuffer.slice(0, limit);
  }

  private topicMatches(pattern: string, topic: string): boolean {
    if (pattern === topic || pattern === '#') return true;
    if (pattern.endsWith('/#')) {
      const prefix = pattern.slice(0, -2);
      return topic.startsWith(prefix);
    }
    return false;
  }
}

export const mqttService = new MqttService();
