const { User } = require("../models/user-model");

// ─────────────────────────────────────────────
//  Get all users (with search & filters)
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const {
      q,                // Search query (name, email, or phone)
      emailVerified,    // "true" or "false"
      phoneVerified,    // "true" or "false"
      approvalStatus,   // "pending", "approved", "rejected"
    } = req.query;

    // Build filter object
    const filter = { role: { $ne: "admin" } }; // Exclude admin from user list

    // Search by name, email, or phone
    if (q) {
      const searchRegex = new RegExp(q, "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Filter by email verification status
    if (emailVerified === "true") filter.isEmailVerified = true;
    if (emailVerified === "false") filter.isEmailVerified = false;

    // Filter by phone verification status
    if (phoneVerified === "true") filter.isPhoneVerified = true;
    if (phoneVerified === "false") filter.isPhoneVerified = false;

    // Filter by approval status
    if (approvalStatus && ["pending", "approved", "rejected"].includes(approvalStatus)) {
      filter.approvalStatus = approvalStatus;
    }

    const users = await User.find(filter, { password: 0 }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      msg: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ msg: "Failed to fetch users" });
  }
};


const getUserByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({ msg: "User fetched", user });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    return res.status(500).json({ msg: "Failed to fetch user" });
  }
};


const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.isEmailVerified || !user.isPhoneVerified) {
      return res.status(400).json({
        msg: "Cannot approve: Both email and phone must be verified first",
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      });
    }

    if (user.approvalStatus === "approved") {
      return res.status(400).json({ msg: "User is already approved" });
    }

    user.approvalStatus = "approved";
    await user.save();

    return res.status(200).json({
      msg: "User approved successfully",
      userId: user._id,
      approvalStatus: user.approvalStatus,
    });
  } catch (error) {
    console.error("Approve User Error:", error);
    return res.status(500).json({ msg: "Failed to approve user" });
  }
};


const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(400).json({ msg: "User is already rejected" });
    }

    user.approvalStatus = "rejected";
    await user.save();

    return res.status(200).json({
      msg: "User rejected successfully",
      userId: user._id,
      approvalStatus: user.approvalStatus,
    });
  } catch (error) {
    console.error("Reject User Error:", error);
    return res.status(500).json({ msg: "Failed to reject user" });
  }
};


const updateUserByID = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    delete updatedData.role;
    delete updatedData.password;
    delete updatedData.isEmailVerified;
    delete updatedData.isPhoneVerified;
    delete updatedData.email;
    delete updatedData.phone;

    const userExists = await User.findOne({ _id: id });

    if (!userExists) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updateResult = await User.updateOne(
      { _id: id },
      { $set: updatedData }
    );

    return res
      .status(200)
      .json({ msg: "User updated successfully", updateResult });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ msg: "Failed to update user" });
  }
};


const deleteUserByID = async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ msg: "Failed to delete user" });
  }
};

module.exports = {
  getAllUsers,
  getUserByID,
  approveUser,
  rejectUser,
  updateUserByID,
  deleteUserByID,
};
