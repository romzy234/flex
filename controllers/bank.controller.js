const { fetchRequest } = require('../utils/request.utils');
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../schema/user.schema');
const Wallet = require('../schema/wallet.schema');
const History = require('../schema/history.schema');
const { response } = require('express');
// uuidv4();

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Web Hook From Glaze
 * @route `/api/v1/payment/webhook/glade/`
 * @access Private
 * @type POST
 */
exports.glade = asyncHandler(async (req, res, next) => {
  const payload = req.body;
  res.end();
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Disbur
 * @route `/bank/transfer`
 * @access Private
 * @type POST
 */
exports.disburseToUserGlade = asyncHandler(async (req, res, next) => {
  try {
    const { amount, account_number, account_name, bank_code } = req.body;
    if (isNaN(Number(amount))) {
      return next(new ErrorResponse('Invalid Amount', 400));
    }

    if (amount <= 0) {
      return next(new ErrorResponse('Invalid Amount', 400));
    }

    const wallet = await Wallet.findOne({ _id: req.user._wallet });

    if (!wallet) {
      return next(new ErrorResponse('Wallet Not Found, Contact Support', 404));
    }
    if (wallet.locked) {
      return next(new ErrorResponse('Account Is Locked, Contact Support', 403));
    }
    if (amount > wallet.amount) {
      return next(new ErrorResponse('Insufficient funds', 400));
    }

    if (!account_number || !bank_code) {
      return next(new ErrorResponse('Account Not Found, Try Again', 404));
    }

    if (bank_code === null || account_number === null) {
      return next(
        new ErrorResponse(
          'Please go to Profile > bank details to include bank details',
          400
        )
      );
    }

    // initiate Transfer
    const trxRef = uuidv4();

    const value = {
      action: 'transfer',
      amount: amount,
      bankcode: bank_code,
      accountnumber: account_number,
      sender_name: account_name,
      narration: 'Transfer From Flex @' + req.user.name,
      orderRef: trxRef
    };

    const headers = {
      mid: 'GP_l0hWXQKlTUmxMauoZBnycMcwYzwHUFzf',
      key: 'DEmFq20JjF4Xo34fpDpJxMTykRECqaw0uVT',
      'Content-Type': 'application/json'
    };
    const transferResponse = await fetchRequest(
      `https://api.glade.ng/disburse`,
      'PUT',
      headers,
      value
    );

    if (transferResponse.status !== 200) {
      return next(new ErrorResponse('Could Not Complete Transfer', 500));
    }

    try {
      const trans = {
        _user: req.user._id,
        _wallet: req.user._wallet,
        amount: amount,
        status: 'Completed',
        date: Date.now(),
        from: 'Glade',
        initor: 'Withdrawal',
        reference: trxRef,
        detail: 'Withdrawal from Glade',
        bank: {
          name: value.sender_name,
          bank: value.bankcode,
          number: value.accountnumber
        }
      };
      await Wallet.findOneAndUpdate(
        { _id: req.user._wallet },
        {
          $inc: { amount: -1 * amount },
          $inc: { outflow: 1 * amount }
        },
        { new: true, runValidators: true }
      );

      await History.create(trans);
    } catch (error) {
      await Wallet.updateOne(
        { _id: req.user._wallet },
        {
          locked: true
        }
      );
      return next(
        new ErrorResponse(
          'Crital Error -- Withdrawal is successfuly But Not Updating Records',
          500
        )
      );
    }

    // Send Notifiction
    // const userss = req.user;
    // const message = withdrawal(userss.firstname, amount);
    // let option = {
    //   email: userss.email,
    //   subject: 'Withdrawal Successfully',
    //   message: message
    // };
    // sendEmail(option);

    res.status(200).json({
      success: true,
      status: 'success',
      data: transferResponse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Verify Bank Account - glade
 * @route `/bank/verify`
 * @access Public
 * @type POST
 */
exports.verifyAccount_Glade = asyncHandler(async (req, res, next) => {
  try {
    const { account_number, bank_code } = req.body;
    if (!account_number) {
      return next(new ErrorResponse('Account Number Is Required', 400));
    }

    if (!bank_code) {
      return next(new ErrorResponse('Bank Code Is Required', 400));
    }
    var data = JSON.stringify({
      inquire: 'accountname',
      accountnumber: account_number,
      bankcode: bank_code
    });
    const headers = {
      mid: 'GP_l0hWXQKlTUmxMauoZBnycMcwYzwHUFzf',
      key: 'DEmFq20JjF4Xo34fpDpJxMTykRECqaw0uVT',
      'Content-Type': 'application/json'
    };
    const account = await fetchRequest(
      `https://api.glade.ng/resources`,
      'PUT',
      headers,
      data
    );
    if (account.status !== 'success') {
      return res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Could not resolve account',
        data: {}
      });
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Account Detail',
      account: account.data
    });
  } catch (error) {
    res.status(401).json({
      success: true,
      status: 'fail',
      message: 'Account Not Found',
      error
    });
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Get All Banks And Code
 * @route `/bank`
 * @access Public
 * @type Get
 */
exports.Banks_Glade = asyncHandler(async (req, res, next) => {
  var data = JSON.stringify({
    inquire: 'banks'
  });
  const headers = {
    mid: 'GP_l0hWXQKlTUmxMauoZBnycMcwYzwHUFzf',
    key: 'DEmFq20JjF4Xo34fpDpJxMTykRECqaw0uVT',
    'Content-Type': 'application/json'
  };
  const banks = await fetchRequest(
    'https://api.glade.ng/resources',
    'PUT',
    headers,
    data
  );
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'List Of Banks',
    banks
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Withdraw to user saved account
 * @route `/bank/withdraw`
 * @access Private
 * @type POST
 */
exports.disburseToSaveUserGlade = asyncHandler(async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (isNaN(Number(amount))) {
      return next(new ErrorResponse('Invalid Amount', 400));
    }

    if (amount <= 0) {
      return next(new ErrorResponse('Invalid Amount', 400));
    }

    const wallet = await Wallet.findOne({ _id: req.user._wallet });

    if (!wallet) {
      return next(new ErrorResponse('Wallet Not Found, Contact Support', 404));
    }
    if (wallet.locked) {
      return next(new ErrorResponse('Account Is Locked, Contact Support', 403));
    }
    if (amount > wallet.amount) {
      return next(new ErrorResponse('Insufficient funds', 400));
    }

    if (!req.user.accountnumber || !req.user.bankcode) {
      return next(
        new ErrorResponse(
          'Please go to Profile > bank details to include bank details',
          404
        )
      );
    }

    if (req.user.bankcode === null || req.user.accountnumber === null) {
      return next(
        new ErrorResponse(
          'Please go to Profile > bank details to include bank details',
          400
        )
      );
    }

    // initiate Transfer
    const trxRef = uuidv4();

    const value = {
      action: 'transfer',
      amount: amount,
      bankcode: req.user.bankcode,
      accountnumber: req.user.accountnumber,
      sender_name: req.user.name,
      narration: 'Withdraw to Self' + req.user.name,
      orderRef: trxRef
    };

    const headers = {
      mid: 'GP_l0hWXQKlTUmxMauoZBnycMcwYzwHUFzf',
      key: 'DEmFq20JjF4Xo34fpDpJxMTykRECqaw0uVT',
      'Content-Type': 'application/json'
    };
    const transferResponse = await fetchRequest(
      `https://api.glade.ng/disburse`,
      'PUT',
      headers,
      value
    );

    if (transferResponse.status !== 200) {
      return next(new ErrorResponse('Could Not Complete Transfer', 500));
    }

    try {
      const trans = {
        _user: req.user._id,
        _wallet: req.user._wallet,
        amount: amount,
        status: 'Completed',
        date: Date.now(),
        from: 'Glade',
        initor: 'Withdrawal',
        reference: trxRef,
        detail: 'Withdrawal from Glade',
        bank: {
          name: value.sender_name,
          bank: value.bankcode,
          number: value.accountnumber
        }
      };
      await Wallet.findOneAndUpdate(
        { _id: req.user._wallet },
        {
          $inc: { amount: -1 * amount },
          $inc: { outflow: 1 * amount }
        },
        { new: true, runValidators: true }
      );

      await History.create(trans);
    } catch (error) {
      await Wallet.updateOne(
        { _id: req.user._wallet },
        {
          locked: true
        }
      );
      return next(
        new ErrorResponse(
          'Crital Error -- Withdrawal is successfuly But Not Updating Records',
          500
        )
      );
    }

    // Send Notifiction
    // const userss = req.user;
    // const message = withdrawal(userss.firstname, amount);
    // let option = {
    //   email: userss.email,
    //   subject: 'Withdrawal Successfully',
    //   message: message
    // };
    // sendEmail(option);

    res.status(200).json({
      success: true,
      status: 'success',
      data: transferResponse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User Bank
 * @route `/bank/save`
 * @access Private
 * @type POST
 */
exports.updateBank = asyncHandler(async (req, res, next) => {
  const { image, thumbnail } = req.body;
  if (!image) {
    return next(new ErrorResponse('Image Url Is Required, Try Again', 400));
  }

  let incoming = {
    image,
    thumbnail
  };

  if (!thumbnail) {
    delete incoming.thumbnail;
  }
  const data = await User.updateOne({ _id: req.user._id }, incoming).select({
    _id: 0
  });

  res.status(201).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Get User Bank Detail
 * @route `/bank/save`
 * @access Public
 * @type Get
 */
exports.userBank = asyncHandler(async (req, res, next) => {
  const data = {
    bankname: req.user.bankname,
    bankcode: req.user.bankcode,
    accountname: req.user.accountname,
    accountnumber: req.user.accountnumber
  };
  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User Bank Detail
 * @route `/bank/save`
 * @access Public
 * @type POST
 */
exports.postUserBank = asyncHandler(async (req, res, next) => {
  const data = {
    bankname: req.body.bankname,
    bankcode: req.body.bankcode,
    accountname: req.body.accountname,
    accountnumber: req.body.accountnumber
  };
  await User.updateOne(
    {
      _id: req.user._id
    },
    data,
    {
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

exports.PayStack = asyncHandler(async (req, res, next) => {
  const payload = req.body;

  const user = await User.findOne({ _id: payload.data.metadata.uid });

  if (payload.event == 'charge.success') {
    const trans = {
      _user: user._id,
      _wallet: user.wallet,
      amount: payload.data.amount / 100,
      status: 'Completed',
      date: Date.now(),
      from: 'Paystack',
      initor: 'Deposit',
      reference: payload.data.reference,
      detail: 'Paystack',
      bank: {
        name: 'server'
      }
    };
  }

  let amount = payload.data.amount / 100;

  await Wallet.findOneAndUpdate(
    { _id: user._wallet },
    {
      $inc: { amount: 1 * amount },
      $inc: { inflow: 1 * amount }
    },
    { new: true, runValidators: true }
  );

  await History.create(trans);

  res.status(201).end();
});
