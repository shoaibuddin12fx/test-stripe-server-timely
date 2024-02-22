const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

class FirebaseService {
  constructor() {
    this.firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID",
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
