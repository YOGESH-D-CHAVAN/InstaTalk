import API from "./api";

const connectionService = {
  sendRequest: async (receiverId) => {
    const { data } = await API.post("/connection/send", { receiverId });
    return data;
  },

  acceptRequest: async (requestId) => {
    const { data } = await API.put(`/connection/accept/${requestId}`);
    return data;
  },

  rejectRequest: async (requestId) => {
    const { data } = await API.delete(`/connection/reject/${requestId}`);
    return data;
  },

  getPendingRequests: async () => {
    const { data } = await API.get("/connection/pending");
    return data;
  },

  getMyConnections: async () => {
    const { data } = await API.get("/connection");
    return data;
  },
};

export default connectionService;
