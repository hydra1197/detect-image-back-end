const functions = require('firebase-functions');
const request = require('request-promise');
const firebase = require('firebase');
const cors = require('cors')({
  origin: true,
});
require('firebase/firestore');

const GOOGLE_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';
const GOOGLE_API_KEY = 'AIzaSyAU491iL5iEH-eYDjMUeobUclf4djlNVAY';

const FIREBASE_API_KEY = 'AIzaSyDGTFj_8l5m6EHjtSwiqzXIVzZZA5EUVcQ';
const FIREBASE_AUTH_DOMAIN = 'image-detector-39d8c.firebaseapp.com';
const FIREBASE_PROJECT_ID = 'image-detector-39d8c';

firebase.initializeApp({
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
});

const db = firebase.firestore();

exports.detectImage = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const options = {
        method: 'POST',
        uri: `${GOOGLE_API_ENDPOINT}?key=${GOOGLE_API_KEY}`,
        body: req.body,
        json: true
      };

      const response = await request(options);

      res.status(200).json({
        status: 200,
        data: response && response.responses && response.responses[0] || response,
      })
    } catch (e) {
      res.status(400).json({
        status: 400,
        data: {
          error : e.error.error || e
        }
      })
    }
  })

});

exports.getDetectList = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const { limit, orderBy, startAfter } = req.query;

      let data = db.collection('images').limit(Number(limit)).orderBy('createdAt', orderBy);

      if (startAfter) {
        data = data.startAfter(startAfter);
      }

      const { docs } = await data.get();

      const list = [];

      if (docs && Array.isArray(docs) && docs.length > 0) {
        docs.map(item => {
          return list.push(item.data());
        });
      }

      res.status(200).send({
        status: 200,
        data: list,
      })

    } catch (e) {
      res.status(400).send({
        status: 400,
        data: {
          error: {
            message: e.message
          }
        }
      })
    }
  })

});

exports.insertDetectData = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      await db.collection('images').add(req.body.data);

      res.status(200).send({
        status: 200,
        data: req.body.data
      })

    } catch (e) {
      res.status(400).send({
        status: 400,
        data: {
          error: {
            message: e.message
          }
        }
      })
    }
  })

});
