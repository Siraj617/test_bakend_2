const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to your User model
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update 'updatedAt' on each save
fcmTokenSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const FcmToken = mongoose.model('FcmToken', fcmTokenSchema);

module.exports = FcmToken;
