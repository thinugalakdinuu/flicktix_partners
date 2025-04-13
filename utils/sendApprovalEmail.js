import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendApprovalEmail = async (email) => {
  await resend.emails.send({
    from: 'admin@flicktix.lk',
    to: email,
    subject: 'You’re approved!',
    html: '<p>Your FlickTix partner account has been approved. You can now log in and set up your theater.</p>',
  });
};
