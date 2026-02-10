/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "<NEXT_PUBLIC_FIREBASE_API_KEY>",
  authDomain: "<NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN>",
  projectId: "<NEXT_PUBLIC_FIREBASE_PROJECT_ID>",
  messagingSenderId: "<NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID>",
  appId: "<NEXT_PUBLIC_FIREBASE_APP_ID>",
});

const messaging = firebase.messaging();

// 백그라운드 푸시 수신
messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "임진매운갈비";
  const options = {
    body: payload?.notification?.body || "조리가 시작되었습니다!",
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});

// 알림 클릭 시 (orderId 있으면 주문상세로 이동)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification?.data || {};
  const orderId = data.orderId;

  const url = orderId ? `/orders/${orderId}` : `/`;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
