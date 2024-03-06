const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

class FirebaseService {
  constructor() {
    this.firebaseConfig = {
      apiKey: "AIzaSyDeUhZOQhygbAlTm_nmziF12_O3tpPFvdU",
      authDomain: "timee-dc4ed.firebaseapp.com",
      projectId: "timee-dc4ed",
      storageBucket: "timee-dc4ed.appspot.com",
      messagingSenderId: "896100934797",
      appId: "1:896100934797:web:5710cd3a7c58387ba82ec4",
      measurementId: "G-38K2DX2FDV",
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
