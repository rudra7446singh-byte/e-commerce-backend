import  transport  from "../config/mailer.js";

const sendEmail = async ({ to, subject, html }) => {
    return transport.sendEmail({
        from: `Your app <${process.env.MAIL_USER}>`,
        to, 
        subject,
        html, 
    })
}

export default sendEmail;