// This client will as the DHT for a service called `rpc_test`
// and then establishes a P2P connection it.
// It will then send { msg: 'hello' } to the RPC server

'use strict'

import {PeerRPCClient} from 'grenache-nodejs-http'
import Link from 'grenache-nodejs-link'
import Order from "./model/order.js"
import OrderSide from "./model/side.js";
import RequestType from "./model/requesttype.js";

const link = new Link({
    grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const payload2 = new Order(OrderSide.SELL, 'BTC', 27000, 8);
peer.request('BTC', {
    'type': RequestType.SUBMIT_ORDER,
    'order': JSON.stringify(payload2)
}, {timeout: 100000}, (err, result) => {
    if (err) throw err
    console.log(
        'submitted',
        payload2,
        'result:',
        result
    )
})
