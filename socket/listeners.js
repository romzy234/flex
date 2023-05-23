const Transaction = require('../schema/transaction');
const Wallet = require('../schema/wallet');
const Notification = require('../schema/notification');

const initializeListeners = async (io) => {
  io.on('connection', (socket) => {
    var userId = socket.handshake.query.userId;
    socket.join(userId);
    socket.on('disconnect', () => {
      socket.leave(userId);
    });
  });

  Wallet.watch().on('change', async (change) => {
    if (change.operationType === 'update') {
      const wallet = await Wallet.findById(change.documentKey._id);
      io.emit('walletChanges', {
        amount: !change.updateDescription.updatedFields.amount
          ? wallet.amount
          : change.updateDescription.updatedFields.amount,
        cummulative_budget_balance: !change.updateDescription.updatedFields
          .cummulative_budget_balance
          ? wallet.cummulative_budget_balance
          : change.updateDescription.updatedFields.cummulative_budget_balance,
        walletId: change.documentKey._id
      });
    } else if (change.operationType === 'insert') {
      io.emit('newWallet', {
        amount: change.fullDocument.amount,
        _id: change.fullDocument._id,
        cummulative_budget_balance:
          change.fullDocument.cummulative_budget_balance,
        user: change.fullDocument.user
      });
    }
  });

  Transaction.watch().on('change', (change) => {
    io.emit('transactionChanges', {
      amount: change.fullDocument.amount,
      _id: change.fullDocument._id,
      transaction_description: change.fullDocument.transaction_description,
      transaction_type: change.fullDocument.transaction_type,
      transaction_ref: change.fullDocument.transaction_ref,
      user: change.fullDocument.user,
      created_at: change.fullDocument.created_at,
      transaction_id: change.fullDocument.transaction_id
    });
  });

  Notification.watch().on('change', (change) => {
    io.emit('notificationChanges', {
      message: change.fullDocument.message,
      title: change.fullDocument.title,
      user: change.fullDocument.user,
      id: change.fullDocument._id,
      created_at: change.fullDocument.created_at
    });
  });
};

module.exports = { initializeListeners };
