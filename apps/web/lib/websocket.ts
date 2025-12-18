import {WebSocketMessage} from '@/types/activity';

type WebSocketCallback = (message: WebSocketMessage) => void;

class WebSocketService {
    private static instance: WebSocketService;
    private socket: WebSocket | null = null;
    private callbacks: Map<string, WebSocketCallback[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000; // 3 seconds
    private connectionPromise: Promise<boolean> | null = null;

    private constructor() {
        this.connect();
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect(): Promise<boolean> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(this.getWebSocketUrl());

                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;
                    resolve(true);
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.socket.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    this.connectionPromise = null;

                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                        setTimeout(() => this.connect(), this.reconnectInterval);
                    } else {
                        console.error('Max reconnection attempts reached');
                        reject(new Error('Failed to connect to WebSocket'));
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connectionPromise = null;
                    reject(error);
                };
            } catch (error) {
                console.error('WebSocket connection error:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.callbacks.clear();
        }
    }

    public subscribe(eventType: string, callback: WebSocketCallback): () => void {
        if (!this.callbacks.has(eventType)) {
            this.callbacks.set(eventType, []);
        }

        const callbacks = this.callbacks.get(eventType)!;
        callbacks.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.callbacks.get(eventType) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    public sendMessage(message: WebSocketMessage): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected. Message not sent:', message);
        }
    }

    public markActivityAsRead(activityId: string): void {
        this.sendMessage({
            type: 'activity_read',
            data: {activityId}
        });
    }

    private getWebSocketUrl(): string {
        // In development, use ws://localhost:3000 for local development
        // In production, use wss://your-api-domain.com
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NODE_ENV === 'production'
            ? 'your-api-domain.com'
            : `${window.location.hostname}:3000`;
        return `${protocol}//${host}/api/ws`;
    }

    private handleMessage(message: WebSocketMessage): void {
        const callbacks = this.callbacks.get(message.type) || [];
        callbacks.forEach(callback => callback(message));
    }
}

export const webSocketService = WebSocketService.getInstance();
