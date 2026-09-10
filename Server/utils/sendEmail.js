const sendEmail = async (options) => {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();

    if (!BREVO_API_KEY) {
      console.error("Missing BREVO_API_KEY in the .env file");
      throw new Error("Missing Email Api Key");
    }

    const data = {
      sender: {
        name: "Real EState Platform",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Email sent successfully:", result.messageId);
    } else {
      console.error("Error sending email:", result);
      throw new Error(result.message || "Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

export default sendEmail;
