const HISTORY_KEY = "shop_all_goods_delivery_history";

export function getDeliveryHistory() {
  const saved = localStorage.getItem(HISTORY_KEY);

  if (!saved) {
    return [];
  }

  return JSON.parse(saved);
}

export function saveDeliveredOrder(order) {
  const history = getDeliveryHistory();

  const exists = history.some(
    (item) => item.id === order.id
  );

  if (exists) {
    return history;
  }

  const deliveredOrder = {
    ...order,
    deliveryStatus: "Delivered",
    deliveredAt: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };

  const updatedHistory = [
    deliveredOrder,
    ...history,
  ];

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(updatedHistory)
  );

  return updatedHistory;
}