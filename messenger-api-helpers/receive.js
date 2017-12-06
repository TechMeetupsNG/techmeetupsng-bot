/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import sendApi from './send';

// ===== STORES ================================================================
import UserStore from '../stores/user-store';
import logger from './fba-logging';
const util = require('util');

// Updates a users preferred event, then notifies them of the change.
const handleNewEventSelected = (senderId, eventId) => {
  const user = UserStore.get(senderId);
  user.setPreferredEvent(eventId);
  sendApi.sendEventChangedMessage(senderId);
};

// Thanks user for purchasing event.
const handleNewEventPurchased = (senderId, eventId) => {
  sendApi.sendEventRegisteredMessage(senderId, eventId);
};


/*
 * handleReceivePostback — Postback event handler triggered by a postback
 * action you, the developer, specify on a button in a template. Read more at:
 * developers.facebook.com/docs/messenger-platform/webhook-reference/postback
 */
const handleReceivePostback = (event) => {
  /**
   * The 'payload' parameter is a developer-defined field which is
   * set in a postbackbutton for Structured Messages.
   *
   * In this case we've defined our payload in our postback
   * actions to be a string that represents a JSON object
   * containing `type` and `data` properties. EG:
   */
  const {type, data} = JSON.parse(event.postback.payload);
  const senderId = event.sender.id;

  // perform an action based on the type of payload received
  switch (type) {
  case 'VIEW_EVENTS':
    sendApi.sendChooseEventMessage(senderId);
    break;
  case 'CHOOSE_GIFT':
    handleNewEventSelected(senderId, data.eventId);
    break;
  case 'GET_STARTED':
    sendApi.sendHelloEventMessage(senderId);
    break;
  default:
    console.error(`Unknown Postback called: ${type}`);
    break;
  }
};

/*
 * handleReceiveMessage - Message Event called when a message is sent to
 * your page. The 'message' object format can vary depending on the kind
 * of message that was received. Read more at: https://developers.facebook.com/
 * docs/messenger-platform/webhook-reference/message-received
 */
const handleReceiveMessage = (event) => {
  const message = event.message;
  const senderId = event.sender.id;

  // It's good practice to send the user a read receipt so they know
  // the bot has seen the message. This can prevent a user
  // spamming the bot if the requests take some time to return.
  sendApi.sendReadReceipt(senderId);

  if (message.text) {
    if (message.text.toLowerCase() == 'show events' || message.text.toLowerCase() == 'events') {
      return sendApi.sendChooseEventMessage(senderId);
    }
    sendApi.sendHelloEventMessage(senderId);
  }
};

/*
 * handleReceiveReferral - Message Event called when a referral event is sent to
 * your page. Read more about the 'referral' object at: https://developers.
 * facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals/
 */
const handleReceiveReferral = (event) => {
  const senderId = event.sender.id;
  var payload = {};
  if (event.referral.ref){
    payload["ref"] = event.referral.ref;
  }
  if (event.referral.ad_id){
    payload["ad_id"] = event.referral.ad_id;
  }
  logger.fbLog("referral", payload, senderId);
};


export default {
  handleReceivePostback,
  handleReceiveMessage,
  handleReceiveReferral,
  handleNewEventSelected,
  handleNewEventPurchased,
};
