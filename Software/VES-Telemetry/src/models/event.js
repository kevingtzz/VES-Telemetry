const { model, Schema } = require('mongoose');

const eventSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    data: {
        minVolt: Number,
        maxVolt: Number,
        current: Number,
        instantVolt: Number,
        soc: Number,
        rssi: Number
    }
});

module.exports = model('Event', eventSchema);