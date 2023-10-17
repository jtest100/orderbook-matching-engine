# Readme
### start the server
```
# install modules
npm install

# boot two grape servers

grape -b 127.0.0.1 --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

# start the node server
node server.js
```
The transaction of matched orders and order books will be printed each time.

### submit BTC buy order
```
node demo_btc_buy_client.js
```

### submit BTC sell order
```
node demo_btc_sell_client.js
```


