import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select("-password");

    // Fetch connection status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (u) => {
        const connection = await Connection.findOne({
          $or: [
            { sender: req.user._id, receiver: u._id },
            { sender: u._id, receiver: req.user._id },
          ],
        });

        let connectionStatus = "none";
        let requestId = null;

        if (connection) {
          if (connection.status === "accepted") {
            connectionStatus = "accepted";
          } else {
            connectionStatus = String(connection.sender) === String(req.user._id) ? "pending_sent" : "pending_received";
            requestId = connection._id;
          }
        }

        return {
          ...u.toObject(),
          connectionStatus,
          requestId,
        };
      })
    );

    res.status(200).json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};
