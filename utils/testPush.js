import admin from "../config/firebase.js";

const token = "d9cyYLLbs7unxsJsbb3RRn:APA91bFc_E0T8zz9A4ms3RP4idIfGpSYvmqZ0iLXqKottw-4IWMnDTPv1mhNXzS_ehE8KcOMFtWvQp449o3aORczEqB6wkfxqXokmdrTcrySDtHeyH4ESw0"; 

const message = {
  token,
  notification: {
    title: "Test Push",
    body: "Firebase push from Node.js",
  },
};

admin.messaging()
  .send(message)
  .then((res) => {
    console.log("✅ Push sent:", res);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Push error:", err);
    process.exit(1);
  });