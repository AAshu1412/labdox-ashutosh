const express = require("express");
const router = express.Router();
const googleController = require("../controllers/google-oauth-controller");
const { googleCompleteRegistrationSchema } = require("../validators/google-oauth-validator");
const validate = require("../middlewares/validate-middleware");


router.route("/google").get(googleController.googleUserAuth);
router.route("/google/callback").get(googleController.googleUserCallback);
router.route("/google/complete-registration").post(validate(googleCompleteRegistrationSchema), googleController.completeGoogleRegistration);
router.route("/google/admin").get(googleController.googleAdminAuth);
router.route("/google/admin/callback").get(googleController.googleAdminCallback);

module.exports = router;
