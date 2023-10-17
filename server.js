// This RPC server will announce itself as `rpc_test`
// in our Grape Bittorrent network
// When it receives requests, it will answer with 'world'

'use strict'

import {PeerRPCServer} from 'grenache-nodejs-http'
import Link from 'grenache-nodejs-link'
import Order from "./model/order.js"
import OrderSide from "./model/side.js"
import RequestType from "./model/requesttype.js";

const link = new Link({
    grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
    timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

// Store the order book in a map
// TODO share
const buyOrderBook = new Map()
const sellOrderBook = new Map()

setInterval(function () {
    link.announce('BTC', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
    if (payload.type === RequestType.SUBMIT_ORDER) {
        // Handle order submission
        const order = new Order().fromJson(JSON.parse(payload.order))
        updateOrderBook(order)
        trade(order.getProductId())
        printOrderBook()
    } else if (payload.type === RequestType.PRINT_ORDER_BOOK) {
        printOrderBook()
    }
    handler.reply(null, {msg: 'done matching'})
})

function updateOrderBook(order) {
    if (order.getSide() === OrderSide.BUY) {
        if (buyOrderBook.has(order.getProductId())) {
            buyOrderBook.set(order.getProductId(), insertOrderBookByPricePriority(buyOrderBook.get(order.getProductId()), order))
        } else {
            buyOrderBook.set(order.getProductId(), [order])
        }
    } else {
        if (sellOrderBook.has(order.getProductId())) {
            sellOrderBook.set(order.getProductId(), insertOrderBookByPricePriority(sellOrderBook.get(order.getProductId()), order))
        } else {
            sellOrderBook.set(order.getProductId(), [order])
        }
    }
}

function trade(productId) {
    const buyPriorityQueue = buyOrderBook.get(productId)
    const sellPriorityQueue = sellOrderBook.get(productId)
    if (buyPriorityQueue == null || sellPriorityQueue == null || buyPriorityQueue.length === 0 || sellPriorityQueue.length === 0) {
        return;
    }

    while (buyPriorityQueue.length > 0 && sellPriorityQueue.length > 0) {
        const buyOrder = buyPriorityQueue[0];
        const sellOrder = sellPriorityQueue[0];

        // Check if the buy order meets the minimum price of any sell order
        if (buyOrder.getPrice() >= sellOrder.getPrice()) {
            // Get the matched quantity for the trade
            // the minimum of the buy or sell order is the limit for this trade
            const matchedQuantity = Math.min(buyOrder.getQuantity(), sellOrder.getQuantity());

            // Print the trade details
            console.log("-----------------")
            console.log(
                "trade: " + sellOrder.getProductId()
                + ", price: " + sellOrder.getPrice()
                + ", quantity: " + matchedQuantity
            );
            console.log("-----------------")

            // Calculate the remaining quantity after the trade
            buyOrder.setQuantity(buyOrder.getQuantity() - matchedQuantity);
            sellOrder.setQuantity(sellOrder.getQuantity() - matchedQuantity);
            // Remove the order from the order book if the quantity is fully matched
            if (buyOrder.getQuantity() === 0) {
                buyPriorityQueue.splice(0, 1);
            }

            if (sellOrder.getQuantity() === 0) {
                sellPriorityQueue.splice(0, 1);
            }
        } else {
            // No matching orders are found, break the loop
            break;
        }
    }
}

function printOrderBook() {
    console.log('buyOrderBook', buyOrderBook)
    console.log('sellOrderBook', sellOrderBook)
}

function insertOrderBookByPricePriority(array, order) {
    let index
    if (order.getSide() === OrderSide.BUY) {
        index = array.findIndex(existingElement => existingElement.getPrice() < order.getPrice())
    } else {
        index = array.findIndex(existingElement => existingElement.getPrice() > order.getPrice())
    }
    if (index === -1) {
        array.push(order)
    } else {
        array.splice(index, 0, order)
    }
    return array
}
