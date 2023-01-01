const WebSocket = require('ws');
const mqtt = require('mqtt')

const WEBSOCKET_URL = 'wss://track.toggl.com/stream';
const ORIGIN = 'https://track.toggl.com';
const API_TOKEN = process.env.API_TOKEN;
const MQTT_BROKER = process.env.MQTT_BROKER;

const mqttClient = mqtt.connect("mqtt://" + MQTT_BROKER)
const ws = new WebSocket(WEBSOCKET_URL, {
    headers: {
        Origin: ORIGIN
    }
});

ws.on('open', function open() {
    console.log('Websocket connection opened');
    ws.send('{"type": "authenticate","api_token": "' + API_TOKEN + '"}');
});

ws.on('message', function message(data) {
    const json = JSON.parse(data);
    if (!!json.action) {
        const model = json["model"] || "unknown";
        mqttClient.publish(`toggl/${model}`, data);
    }
    if(json.type === 'ping') {
        ws.send('{"type": "pong"}')
    }
});

mqttClient.on('connect', function () {
    console.log('connected to mqtt broker');
});