const gcm = require('node-gcm');
var sender = null;

const send = async (devicesTokens, msg, retrys = 1) => {

  const p = new Promise((res, rej) => {
    try {
      if (sender == null) throw "Sender is Null! (Call setup(env) first!)";
      msg.options = msg.options || {};

      var message = new gcm.Message({
        collapseKey: msg.options.collapseKey || 'demo',
        priority: msg.options.priority || 'high',
        contentAvailable: msg.options.priority || true,
        delayWhileIdle: msg.options.priority || true,
        timeToLive: msg.options.priority || 3,
        restrictedPackageName: msg.options.priority || "somePackageName",
        dryRun: msg.options.priority || true,
        data: msg.data,
        notification: msg.notification
      });

      sender.send(message,
        { registrationTokens: devicesTokens },
        retrys,
        (err, response) => {
          if (err) throw err
          var failed_tokens = devicesTokens.filter((token, i) => response.results[i].error != null);
          console.log('Res:', response);
          console.log('These tokens are no longer ok:', failed_tokens);
          res({ res: response, failed_tokens: failed_tokens });
        });
    } catch (error) {
      console.log(error);
      rej("Message failed!");
    }
  });
  return await p.catch(e => { throw e });
};

const dummyTestMessage = async () => {
  var msg = {};
  
  // Estos tokens no existen:
  var tokens = ["f6H3T_YpR7yy2bjVs_Jonv:APA91bHXFMje1q2pSzHCkVsTl95wXLBLMm9h8Tu-jR0bB-5_lNvmTI43LJRx_aZVMmnUolBhK3VyUQcX7Cpl9mSYP5pi8eMrg_7t0TgeyV5AB7RlJ4JLZEo88BFM8UXTdRdW4TpOdbGJ",
    "fclRTT2hQnOVntGInlLABk:APA91bHHlSSyyGWE24duoCUwMtFgb6-Tgl5bgon11IxmgtfZkqSyX3rzaYihrbe6jZzmZ7iUB030I6ESL_g-XMhuYTthUl4rFcu6RS0qoah1xQS1WcmUZJ7rb2Abq4dJBsZzwL9GG2RB",
  "invalidtoken"];

  console.log("Testing FCM client:");
  await send(tokens, msg, 1).catch(error => {
    console.log(error);
    throw "Server is not working (check serverToken)";
  });

  console.log("FCM client working ok!");
};

const setup = async (env, ADN) => {
  // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
  sender = new gcm.Sender(env.serverToken);
  //Test del sender
  await dummyTestMessage().catch(error => {
    console.log(error);
    throw "FCM Client not working (check serverToken)!";
  })
}

module.exports = { setup, send }