export default class Order {
    constructor(side, productId, price, quantity) {
        this.side = side;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
    }

    getSide() {
        return this.side;
    }

    getProductId() {
        return this.productId;
    }

    getPrice() {
        return this.price;
    }

    getQuantity() {
        return this.quantity;
    }

    setQuantity(quantity) {
        this.quantity = quantity;
    }

    fromJson(json) {
        this.side = json.side;
        this.productId = json.productId;
        this.price = json.price;
        this.quantity = json.quantity;
        return this;
    }
}
