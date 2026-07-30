const emailOTPTemplate = (name,otp) => {
    return `
        <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2>Welcome ${name} 👋</h2>
            <p>Thank you for registering with our application.</p>
            <p>Your account has been created successfully.</p>
            <p>Your OTP is: ${otp}</p>
            <p>This otp will expire in 5 minutes.</p>
            <p>Regards,<br>Ashutosh Mittal</p>
        </div>
    `;
};
module.exports = emailOTPTemplate;