/*
The MIT License (MIT)

Copyright (c) 2017 RealtimeBoard Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var ERROR_REASONS = {
  USER_BLOCKED: "userBlocked",
  AUTH_FAILED: "authorizationFailed"
};

var BLOCK_REASONS = {
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  TERMS_VIOLATION: "TERMS_VIOLATION",
  USER_DELETED: "USER_DELETED"
};

var ERROR_MESSAGES = {
  SUSPICIOUS_ACTIVITY: 'Your account is locked due to suspicious activity.',
  TERMS_VIOLATION: 'Your account is locked due to a Terms of Use violation.',
  USER_DELETED: 'Your account is currently being deleted.',
  USER_DELETED_DESC: 'Until then, you cannot log in or create an account with this email.',
  CONTACT_US: 'Please contact our support team at support@realtimeboard.com for further assistance.',
  PASSWORD_INCORRECT: 'The username or password you entered is incorrect.'
};

function getMessagesByError(error) {
  var messages = {
    label: nil,
    alert: nil
  }

  if (error.code == 403 && error.reason == ERROR_REASONS.USER_BLOCKED) {
    var blockReason = JSON.parse(error.location)[0];
    var messageEnd = "";

    messages.label = ERROR_MESSAGES[blockReason];

    if (blockReason == BLOCK_REASONS.SUSPICIOUS_ACTIVITY || blockReason == BLOCK_REASONS.TERMS_VIOLATION) {
      messageEnd = ERROR_MESSAGES.CONTACT_US;
    } else if (blockReason == BLOCK_REASONS.USER_DELETED) {
      messageEnd = ERROR_MESSAGES.USER_DELETED_DESC;
    }

    messages.alert = ERROR_MESSAGES[blockReason] + " " + messageEnd;
  } else {
    messages.label = ERROR_MESSAGES.PASSWORD_INCORRECT;
  }

  return messages;
}

function makeSubclass(className, BaseClass, selectorHandlerDict) {
  var uniqueClassName = className + NSUUID.UUID().UUIDString();
  var delegateClassDesc = MOClassDescription.allocateDescriptionForClassWithName_superclass_(uniqueClassName, BaseClass);

  for (var selectorString in selectorHandlerDict) {
    delegateClassDesc.addInstanceMethodWithSelector_function_(selectorString, selectorHandlerDict[selectorString]);
  }

  delegateClassDesc.registerClass();

  return NSClassFromString(uniqueClassName);
}
