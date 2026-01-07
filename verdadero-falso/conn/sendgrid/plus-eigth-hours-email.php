<?php

function PlusEightHoursToLeader($leader_name, $employee_name)
{
    return '<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">

    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="x-apple-disable-message-reformatting" />
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light only">
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap");

        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background: #ffffff !important;
          font-family: \'Work Sans\', Arial, sans-serif;
        }

        .container {
          width: 600px;
          max-width: 600px;
          background-color: #ffffff;
          margin: 0 auto;
          padding: 0;
          border: 1px solid #dddddd;
          border-radius: 12px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .content {
          padding: 0 8%;
        }

        .logo {
          width: 120px;
        }

        .title {
          font-size: 33px;
          line-height: 38px;
          color: #2B2B2B;
          font-weight: bold;
          text-align: left;
        }

        .subtitle {
          font-size: 16px;
          line-height: 23px;
          color: #2B2B2B;
          font-weight: 500;
          text-align: left;
          text-transform: uppercase;
        }

        .text {
          font-size: 16px;
          line-height: 23px;
          color: #2B2B2B;
          font-weight: 500;
          text-align: left;
        }

        .highlight {
          font-weight: bold;
          color: #000000;
        }

        .notice-box {
          background-color: #FFF9C4;
          padding: 40px;
          margin-top: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          border: 1px solid #FFECB3;
          text-align: center; /* Centrar el contenido */
        }

        .notice-text {
          font-size: 21px;
          line-height: 35px;
          color: #2B2B2B;
          font-weight: 500;
          font-style: italic;
          text-align: center; /* Centrar el texto */
        }

        .footer {
          font-size: 12px;
          line-height: 18px;
          color: #2B2B2B;
          font-weight: 500;
          text-align: left;
        }

        .footer .logo {
          width: 100px;
        }

        .social-icons img {
          width: 24px;
          margin-left: 5px;
          margin-right: 5px;
        }

        @media screen and (max-width: 480px) {
          .container {
            width: 100% !important;
            max-width: 100% !important;
          }
          .content {
            padding: 0 5%;
          }
          .logo {
            width: 90px;
          }
          .title {
            font-size: 24px;
            line-height: 28px;
          }
          .subtitle {
            font-size: 14px;
            line-height: 20px;
          }
          .text {
            font-size: 14px;
            line-height: 20px;
          }
          .notice-text {
            font-size: 16px;
            line-height: 22px;
          }
          .notice-box {
            padding: 20px;
          }
          .footer {
            font-size: 10px;
            line-height: 14px;
          }
          .footer .logo {
            width: 80px;
          }
          .social-icons img {
            width: 20px;
          }
        }
      </style>
    </head>

    <body>
      <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
        <tr>
          <td align="center">
            <table class="container" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div class="content">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td height="35"></td>
                      </tr>
                      <tr>
                        <td align="left">
                          <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" class="logo" alt="Kahlo" title="Kahlo" />
                        </td>
                      </tr>
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td height="20"></td>
                      </tr>
                      <tr>
                        <td class="title">¡Hola, ' . $leader_name . '! 👋</td>
                      </tr>
                      <tr>
                        <td height="25"></td>
                      </tr>
                      <tr>
                        <td>
                          <div class="notice-box">
                            <span class="notice-text">Queremos informarte que <span class="highlight">' . $employee_name . '</span><br>ha trabajado más de 8 horas hoy.</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td class="text">Sería bueno que converses con tu equipo sobre este tema para asegurar una adecuada gestión del tiempo y bienestar laboral.</td>
                      </tr>
                      <tr>
                        <td height="25"></td>
                      </tr>
                      <tr>
                        <td class="text">Si necesitas más información o apoyo, estamos a tu disposición.</td>
                      </tr>
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td class="text">Saludos cordiales,<br>El equipo de Kahlo Agencia</td>
                      </tr>
                      <tr>
                        <td height="45"></td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1px solid #C4C4C4;"></td>
                      </tr>
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td class="footer" width="50%" valign="top">
                                <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" class="logo" alt="Kahlo" title="Kahlo" /><br><br>
                                Aguirre 540 2B<br>
                                Buenos Aires<br>
                                Argentina
                              </td>
                              <td width="50%" align="right" valign="top">
                                <div class="social-icons">
                                  <a href="https://www.facebook.com/kahloagencia/" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/fb.png" alt="Facebook" title="Facebook"></a>
                                  <a href="https://www.instagram.com/kahloagencia" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/ig.png" alt="Instagram" title="Instagram"></a>
                                  <a href="https://wa.me/+5491132905198" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/wpp.png" alt="WhatsApp" title="WhatsApp"></a>
                                  <a href="https://www.linkedin.com/company/kahlo-agencia/" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/linkedin.png" alt="LinkedIn" title="LinkedIn"></a>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td height="45"></td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>

    </html>';
}

?>
