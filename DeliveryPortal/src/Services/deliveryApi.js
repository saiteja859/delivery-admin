const API_BASE_URL = "http://localhost:5001/api";

const getDeliveryToken = () => {
  return localStorage.getItem("deliveryToken");
};

const deliveryApi = async (endpoint, options = {}) => {
  const token = getDeliveryToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || "Delivery API request failed"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default deliveryApi;