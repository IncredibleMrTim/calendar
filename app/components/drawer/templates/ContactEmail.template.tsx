interface ContactEmailTemplateProps {
  email: string;
  message: string;
  firstName: string;
  lastName: string;
}

export const ContactEmailTemplate = ({
  email,
  message,
  firstName,
  lastName,
}: ContactEmailTemplateProps): string => {
  const hours = new Date().getHours();
  let period: string;
  if (hours >= 4 && hours <= 11) period = "morning";
  else if (hours >= 12 && hours <= 16) period = "afternoon";
  else if (hours >= 17 && hours <= 22) period = "evening";
  else period = "night";

  return `
    <div style="padding: 4px">
      <p>Good ${period} Administrator.</p>
      <p>
        <i>You have a new message from ${firstName} ${lastName}</i>
      </p>
      <div>Email: <span style="font-weight: bold">${email}</span></div>
      <hr />
      <p>${message}</p>
    </div>
  `;
};
