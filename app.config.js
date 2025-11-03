import 'dotenv/config';

export default {
  expo: {
    name: "cad-trackerz-frontend",
    slug: "cad-trackerz-frontend",
    version: "1.0.0",
    android: {
      package: "com.cad.cadtrackerzfrontend", // 👈 unique package name
    },
    extra: {
      API_IP: process.env.API_IP || "https://cad-trackerz-backend.onrender.com/api", // fallback if not set
      eas:{
        projectId: "27b27d31-2dc3-4b34-8ae0-9ddfcfcd68e9"
      }
    },
  },
};
