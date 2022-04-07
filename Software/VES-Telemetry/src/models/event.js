const { model, Schema } = require('mongoose');

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    data: [{}]
});

module.exports = model('Event', eventSchema);