const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification-controller");
const {sendEmailOTPSchema, verifyEmailOTPSchema, sendPhoneOTPSchema, verifyPhoneOTPSchema} = require("../validators/verification-validator");
const validate = require("../middlewares/validate-middleware");
const authMiddleware = require("../middlewares/auth-middleware");



router.route("/sendemailotp").post(authMiddleware, validate(sendEmailOTPSchema), verificationController.emailOTPSender);
router.route("/verifyemailotp").post(authMiddleware, validate(verifyEmailOTPSchema), verificationController.verifyEmailOTP);
router.route("/sendphoneotp").post(authMiddleware, validate(sendPhoneOTPSchema), verificationController.phoneOTPSender);
router.route("/verifyphoneotp").post(authMiddleware, validate(verifyPhoneOTPSchema), verificationController.verifyPhoneOTP);

module.exports = router;