import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api/bookings",
});

export const getAllBookings = async () => {
  const response = await API.get("/");
  return response.data;
};

export const getMyBookings = async (userEmail) => {
  const response = await API.get(`/my?userEmail=${encodeURIComponent(userEmail)}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await API.post("/", bookingData);
  return response.data;
};

export const updateBookingStatus = async (id, data) => {
  const response = await API.patch(`/${id}/status`, data);
  return response.data;
};

export const cancelBooking = async (id, userEmail) => {
  const response = await API.delete(`/${id}?userEmail=${encodeURIComponent(userEmail)}`);
  return response.data;
};