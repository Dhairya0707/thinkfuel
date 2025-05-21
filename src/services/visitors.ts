import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../service/firebase.config";

interface VisitorData {
  ip: string;
  country?: string;
  city?: string;
  region?: string;
  userAgent: string;
  referrer: string;
  timestamp: any;
  path: string;
}

export const trackVisitor = async () => {
  try {
    // Get visitor's IP and location data
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();

    // Get location data using ipinfo.io (you'll need to sign up for a free API key)
    const locationResponse = await fetch(
      `https://ipinfo.io/${ipData.ip}/json?token=c8a6ddd0bc8b4d`
    );
    const locationData = await locationResponse.json();

    const visitorData: VisitorData = {
      ip: ipData.ip,
      country: locationData.country,
      city: locationData.city,
      region: locationData.region,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: serverTimestamp(),
      path: window.location.pathname,
    };

    // Save to Firebase
    await addDoc(collection(db, "visitors"), visitorData);
  } catch (error) {
    console.error("Error tracking visitor:", error);
  }
};
