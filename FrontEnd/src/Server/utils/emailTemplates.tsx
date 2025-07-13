
/**
 * Генерирует HTML-шаблон для письма подтверждения аккаунта
 * 
 * @param userName - имя пользователя
 * @param verificationLink - ссылка для подтверждения
 * @returns HTML-строка с шаблоном письма
 */
export const generateVerificationEmail = (userName: string, verificationLink: string): string => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Подтверждение аккаунта</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-height: 60px;
            margin-bottom: 10px;
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 14px;
            color: #666;
          }
          .link-fallback {
            display: block;
            margin-top: 20px;
            word-break: break-all;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Подтверждение аккаунта</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${userName}</strong>!</p>
            <p>Благодарим вас за регистрацию. Для активации вашего аккаунта, пожалуйста, нажмите на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Подтвердить аккаунт</a>
            </div>
            
            <p class="link-fallback">
              Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку вашего браузера:<br>
              <a href="${verificationLink}">${verificationLink}</a>
            </p>
            
            <p>Данная ссылка будет активна в течение 24 часов. Если вы не запрашивали регистрацию, пожалуйста, проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>С уважением, команда поддержки</p>
            <p>&copy; ${new Date().getFullYear()} Все права защищены</p>
          </div>
        </div>
      </body>
    </html>
    `;
  };
  
  /**
   * Генерирует HTML-шаблон для письма о сбросе пароля
   * 
   * @param userName - имя пользователя
   * @param resetLink - ссылка для сброса пароля
   * @returns HTML-строка с шаблоном письма
   */
  export const generatePasswordResetEmail = (userName: string, resetLink: string): string => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Сброс пароля</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-height: 60px;
            margin-bottom: 10px;
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 14px;
            color: #666;
          }
          .link-fallback {
            display: block;
            margin-top: 20px;
            word-break: break-all;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Сброс пароля</h1>
          </div>
          <div class="content">
            <p>Здравствуйте, <strong>${userName}</strong>!</p>
            <p>Вы запросили сброс пароля. Для создания нового пароля, пожалуйста, нажмите на кнопку ниже:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Сбросить пароль</a>
            </div>
            
            <p class="link-fallback">
              Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку вашего браузера:<br>
              <a href="${resetLink}">${resetLink}</a>
            </p>
            
            <p>Данная ссылка будет активна в течение 1 часа. Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>С уважением, команда поддержки</p>
            <p>&copy; ${new Date().getFullYear()} Все права защищены</p>
          </div>
        </div>
      </body>
    </html>
    `;
  };