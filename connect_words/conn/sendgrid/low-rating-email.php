<?php

function LowRatingEmail($supervisor_name, $employee_name, $employee_comment)
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
          width: 120px; /* Increased size */
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

        .comment-box {
          background-color: #d7f3e0;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
        }

        .comment-text {
          font-size: 18px;
          line-height: 23px;
          color: #2B2B2B;
          font-weight: 500;
        }

        .footer {
          font-size: 12px; /* Increased size */
          line-height: 18px;
          color: #2B2B2B;
          font-weight: 500;
          text-align: left;
        }

        .footer .logo {
          width: 100px; /* Increased size */
        }

        .social-icons img {
          width: 24px; /* Increased size */
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
            width: 90px; /* Adjusted size for mobile */
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
          .comment-text {
            font-size: 16px;
            line-height: 22px;
          }
          .footer {
            font-size: 10px;
            line-height: 14px;
          }
          .footer .logo {
            width: 80px; /* Adjusted size for mobile */
          }
          .social-icons img {
            width: 20px; /* Adjusted size for mobile */
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
                        <td class="subtitle">ENCUESTA DE PULSO</td>
                      </tr>
                      <tr>
                        <td height="20"></td>
                      </tr>
                      <tr>
                        <td class="title">'.$employee_name.' necesita tu atención!</td>
                      </tr>
                      <tr>
                        <td height="25"></td>
                      </tr>
                      <tr>
                        <td class="text">Te contamos que <span class="highlight">'.$employee_name.'</span> tuvo una calificación baja en la encuesta de pulso. Además, dejó este comentario:</td>
                      </tr>
                      <tr>
                        <td height="25"></td>
                      </tr>
                      <!-- Green Comment Box -->
                      <tr>
                        <td class="comment-box">
                          <div class="comment-text">"'.$employee_comment.'"</div>
                        </td>
                      </tr>
                      <!-- End of Green Comment Box -->
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td class="text">Estaría bueno que hables con <span class="highlight">'.$employee_name.'</span> para ver cómo podés ayudar. Tu apoyo puede hacer la diferencia.</td>
                      </tr>
                      <tr>
                        <td height="25"></td>
                      </tr>
                      <tr>
                        <td class="text">Gracias por estar siempre presente para tu equipo.</td>
                      </tr>
                      <tr>
                        <td height="40"></td>
                      </tr>
                      <tr>
                        <td class="text">Saludos,<br>El equipo de Kahlo Agencia</td>
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
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/wpp.png" alt="Whatsapp" title="Whatsapp"></a>
                                  <a href="https://www.linkedin.com/company/kahlo-agencia/" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/linkedin.png" alt="Linkedin" title="Linkedin"></a>
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
