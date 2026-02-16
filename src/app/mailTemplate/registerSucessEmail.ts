// const registrationSuccessEmailBody = (name: string, activationCode: number) => `
//   <html>
//     <head>
//       <style>
//         body {
//           font-family: 'Helvetica', 'Arial', sans-serif;
//           margin: 0;
//           padding: 0;
//           background-color: #f7f9fc;
//         }
//         .container {
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 40px 20px;
//           background-color: #ffffff;
//           border-radius: 8px;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }
//         .header {
//           background-color: #007bff;
//           padding: 20px;
//           border-top-left-radius: 8px;
//           border-top-right-radius: 8px;
//           color: #ffffff;
//           text-align: center;
//         }
//         .header h1 {
//           margin: 0;
//           font-size: 24px;
//           font-weight: 600;
//         }
//         .content {
//           padding: 30px;
//           color: #333333;
//         }
//         .content h2 {
//           font-size: 22px;
//           color: #333333;
//           margin-bottom: 20px;
//           font-weight: 600;
//         }
//         .content p {
//           font-size: 16px;
//           color: #666666;
//           line-height: 1.6;
//           margin-bottom: 20px;
//         }
//         .activation-code {
//           font-size: 28px;
//           color: #007bff;
//           font-weight: 700;
//           text-align: center;
//           margin-bottom: 20px;
//         }
//         .button-container {
//           text-align: center;
//           margin: 40px 0;
//         }
//         .button {
//           padding: 12px 30px;
//           background-color: #007bff;
//           color: #ffffff;
//           text-decoration: none;
//           border-radius: 6px;
//           font-size: 16px;
//           font-weight: 600;
//         }
//         .button-text {
//           color: #fff;
//         }
//         .button:hover {
//           background-color: #0056b3;
//         }
//         .footer {
//           padding: 20px;
//           font-size: 14px;
//           color: #999999;
//           text-align: center;
//           background-color: #f7f9fc;
//           border-bottom-left-radius: 8px;
//           border-bottom-right-radius: 8px;
//         }
//         .footer p {
//           margin: 5px 0;
//         }
//         .footer a {
//           color: #007bff;
//           text-decoration: none;
//         }
//         .footer a:hover {
//           text-decoration: underline;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Welcome to Sampli</h1>
//         </div>
//         <div class="content">
//           <h2>Hello,</h2>

//           <p>Thank you for registering with Sampli. To activate your account, please use the following activation code:</p>
//             <div class="activation-code">${activationCode || 'XXXXXX'}</div>
//             <p>Enter this code on the activation page within the next 05 minutes. If you don't your account will be deleted from the database and you will need to register again.</p>
//             <p>If you didn't register, ignore this email.</p>
//             /* TODO: set client email here  */
//           <p>If you have any questions, feel free to contact us at <a href="maniksarker265@gmail.com">maniksarker265@gmail.com</a>.</p>
//         </div>
//         <div class="footer">
//           <p>&copy; ${new Date().getFullYear()} Sampli. All rights reserved.</p>
//           <p><a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/contact">Contact Us</a></p>
//         </div>
//       </div>
//     </body>
//   </html>
// `;

// export default registrationSuccessEmailBody;

const registrationSuccessEmailBody = (name: string, activationCode: number) => `
<html>
<head>
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
    }

    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .header {
      background-color: #007bff;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .content {
      padding: 30px;
      color: #333333;
    }

    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }

    .code-box {
      text-align: center;
      margin: 30px 0;
    }

    .code {
      display: inline-block;
      padding: 14px 28px;
      font-size: 28px;
      font-weight: bold;
      color: #007bff;
      background-color: #f1f7ff;
      border-radius: 6px;
      letter-spacing: 4px;
    }

    .footer {
      background-color: #f4f6f8;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #777777;
    }

    .footer a {
      color: #007bff;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .signature {
      margin-top: 30px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>Welcome to Sampli</h1>
    </div>

    <div class="content">

      <p>Hello${name ? ` ${name}` : ''},</p>

      <p>Thank you for signing up for Sampli.</p>

      <p>To activate your account, please use the verification code below:</p>

      <div class="code-box">
        <div class="code">${activationCode || '000000'}</div>
      </div>

      <p>
        This code will expire in <strong>5 minutes</strong>. Enter it on the verification page to complete your registration.
      </p>

      <p>
        If you did not create an account with Sampli, you can safely ignore this email.
      </p>

      <p>
        If you have any questions or need assistance, please contact us at 
        <a href="mailto:support@sampli.io">support@sampli.io</a>.
      </p>

      <div class="signature">
        <p>We’re excited to have you on board!</p>

        <p>
          Best regards,<br/>
          <strong>The Sampli Team</strong>
        </p>
      </div>

    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Sampli. All rights reserved.</p>
      <p>
        <a href="https://sampli.io/privacy">Privacy Policy</a> |
        <a href="https://sampli.io/contact">Contact Us</a>
      </p>
    </div>

  </div>

</body>
</html>
`;

export default registrationSuccessEmailBody;
