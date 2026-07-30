const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");

router.use(authMiddleware, adminMiddleware);
router.route("/users").get(adminController.getAllUsers);
router.route("/users/:id").get(adminController.getUserByID);
router.route("/users/approve/:id").patch(adminController.approveUser);
router.route("/users/reject/:id").patch(adminController.rejectUser);
router.route("/users/update/:id").patch(adminController.updateUserByID);
router.route("/users/delete/:id").delete(adminController.deleteUserByID);

module.exports = router;
