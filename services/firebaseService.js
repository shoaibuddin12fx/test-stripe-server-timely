const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

class FirebaseService {
  constructor() {
    this.firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SERVICE_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };
    

    this.initializeFirebase(serviceAccount);
  }

  initializeFirebase(serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized successfully");
    }
  }

  async getDataFromFirebase(data) {
    try {
      const snapshot = await admin
        .firestore()
        .collection("subscriptions")
        .where("subscription.id", "==", data.subscriptionId)
        .get();

      if (!snapshot.empty) {
        const subscriptionData = snapshot.docs[0].data();

        const snapshot1 = await admin
          .firestore()
          .collection("employee")
          .where("employerId", "==", subscriptionData.uid)
          .get();
        const employeeDataArray = snapshot1.docs.map((doc) => {
          const employeeData = doc.data();
          // Update the 'active' field to false
          return { ...employeeData, disabled: true };
        });

        return employeeDataArray;
      } else {
        console.error(
          `Subscription with ID ${data.subscriptionId} not found in Firebase`
        );
        return null; // or handle accordingly based on your requirements
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      throw error;
    }
  }
}

module.exports = FirebaseService;
