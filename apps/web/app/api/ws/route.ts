import {WebSocketServer} from 'ws';
import {NextRequest, NextResponse} from 'next/server';
import {verifyAuth} from '@/lib/auth';

// This will store all active connections
const clients = new Map();

// Create WebSocket server
const wss = new WebSocketServer({noServer: true});

// Handle WebSocket connection
wss.on('connection', (ws, request, client) => {
    const connectionId = client.userId;

    // Store the connection
    clients.set(connectionId, ws);
    console.log(`Client connected: ${connectionId}`);

    // Send connection established message
    ws.send(JSON.stringify({
        type: 'connection_established',
        data: {
            message: 'Connection established',
            connectionId,
        },
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            switch (data.type) {
                case 'activity_read':
                    // Handle marking activity as read in the database
                    console.log(`Activity marked as read: ${data.data.activityId}`);
                    break;

                case 'ping':
                    // Respond to ping with pong
                    ws.send(JSON.stringify({type: 'pong', data: {timestamp: Date.now()}}));
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(connectionId);
        console.log(`Client disconnected: ${connectionId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${connectionId}:`, error);
    });
});

// Send activity to a specific user
function sendToUser(userId: string, activity: any) {
    const ws = clients.get(userId);
    if (ws && ws.readyState === 1) { // 1 = OPEN
        ws.send(JSON.stringify({
            type: 'new_activity',
            data: activity,
        }));
    }
}

// Send activity to multiple users
function broadcast(activity: any, userIds: string[]) {
    const message = JSON.stringify({
        type: 'new_activity',
        data: activity,
    });

    userIds.forEach(userId => {
        const ws = clients.get(userId);
        if (ws && ws.readyState === 1) { // 1 = OPEN
            ws.send(message);
        }
    });
}

// Handle HTTP request to upgrade to WebSocket
export async function GET(request: NextRequest) {
    // Get the user ID from the session
    const session = await verifyAuth(request);

    if (!session) {
        return new NextResponse('Unauthorized', {status: 401});
    }

    // Check if the request is a WebSocket upgrade request
    const upgradeHeader = request.headers.get('upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        return new NextResponse('Expected Upgrade: WebSocket', {status: 426});
    }

    // Handle the WebSocket upgrade
    const {socket, response} = await Deno.upgradeWebSocket(request);

    // Add the user ID to the socket object for later use
    (socket as any).userId = session.userId;

    // Handle the WebSocket connection
    wss.handleUpgrade(request, socket, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws, request, {userId: session.userId});
    });

    return response;
}

// Export the send and broadcast functions for use in other API routes
export {sendToUser, broadcast};
