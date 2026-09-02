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
  } catch (error) {}
};
