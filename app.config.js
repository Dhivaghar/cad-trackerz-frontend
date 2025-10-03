import 'dotenv/config';

export default {
  expo: {
    name: "cad-trackerz-frontend",
    slug: "cad-trackerz-frontend",
    version: "1.0.0",
    extra: {
      API_IP: process.env.API_IP || "192.168.1.100", // fallback if not set
    },
  },
};
