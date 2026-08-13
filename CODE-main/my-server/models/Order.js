const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    userName: {
        type: String,
        required: true
    },

    orderItems: [
        {
            name: String,
            qty: Number,
            image: String,
            price: Number,
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },

    paymentMethod: {
        type: String,
        enum: ["online", "cod"],
        default: "online"
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: Date,

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    }

},
{
    timestamps: true
}
);

module.exports = mongoose.model("Order", orderSchema);
