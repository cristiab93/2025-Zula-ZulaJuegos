<?php

function MailCalificarProveedorBody($provider_name, $project_name, $link)
{
  return '<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@500,700&display=swap");
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: #ffffff !important;
        font-family: "Work Sans", Arial, sans-serif;
      }
      table {
        border-spacing: 0;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      table td {
        border-collapse: collapse;
      }
      .imgcomun {
        border: 0;
        max-width: 100%;
        height: auto;
        display: block;
      }
      @media only screen and (max-width: 480px) {
        .container {
          width: 100% !important;
          max-width: 100% !important;
        }
        .footer-left,
        .footer-right {
          width: 50% !important;
          display: table-cell !important;
          vertical-align: top !important;
        }
        .footer-left {
          text-align: left !important;
        }
        .footer-right {
          text-align: right !important;
        }
        td[class="social-links"] {
          display: none !important;
          visibility: hidden !important;
          mso-hide: all !important;
          max-height: 0 !important;
          overflow: hidden !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; text-decoration: none !important;" bgcolor="#ffffff">
    <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
      <tbody>
        <tr>
          <td align="center" valign="top" bgcolor="#ffffff">
            <table border="0" width="600" cellpadding="0" cellspacing="0" class="container"
              style="width:600px;max-width:600px;background-color:#ffffff;overflow:hidden;box-sizing:border-box;margin:0 auto;padding:0;border:1px solid #dddddd;border-radius:12px;"
              bgcolor="#ffffff">
              <tr>
                <td width="100%">
                  <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                    <td width="8%"></td>
                    <td width="84%">
                      <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="100%" height="35"></td>
                        </tr>
                        <tr>
                          <td align="left">
                            <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="83" alt="Kahlo" title="Kahlo" />
                          </td>
                        </tr>
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td align="left"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:14px;line-height:20px;color:#2B2B2B;font-weight:500;text-transform:uppercase;">
                            QUEREMOS SABER TU OPINIÓN
                          </td>
                        </tr>
                        <tr>
                          <td height="20" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td align="center"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:26px;line-height:30px;color:#2B2B2B;font-weight:bold;text-align:center;">
                            Trabajaste con '.$provider_name.'.
                            <br>
                            ¡Contanos qué te pareció!
                          </td>
                        </tr>
                        <tr>
                          <td height="35" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td style="background-color: #d7f3e0; border-radius:12px; padding: 30px 20px;" bgcolor="#d7f3e0">
                            <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0"
                              style="border-collapse:collapse;border-radius:13px;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                              <tr>
                                <td align="center"
                                  style="font-family:\'Work Sans\', Arial, sans-serif;font-size:16px;line-height:22px;color:#2B2B2B;font-weight:500;text-align:center;">
                                  Nos encantaría que compartas tu evaluación sobre '.$provider_name.' en el proyecto '.$project_name.'. <br>Contanos cómo sentiste el desarrollo del proyecto.
                                  <br>
                                  ¡Tu feedback es muy importante para nosotros!
                                </td>
                              </tr>
                              <tr>
                                <td height="25" style="font-size:1px;line-height:1px;"></td>
                              </tr>
                              <tr>
                                <td align="center">
                                  <a href="'.$link.'"
                                    style="font-family:\'Work Sans\', Arial, sans-serif;font-size:14px;line-height:18px;color:#ffffff;text-decoration:none;font-weight:bold;background-color:#2B2B2B;padding:12px 30px;border-radius:6px;display:inline-block;">
                                    Calificar
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td height="10" style="font-size:1px;line-height:1px;"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td height="25" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td align="center"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:16px;line-height:22px;color:#2B2B2B;font-weight:500;text-align:center;">
                            Si no tuviste contacto con este proveedor, podés ignorar este mail sin problema.
                          </td>
                        </tr>
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td height="20" style="border-bottom:1px solid #C4C4C4;"></td>
                        </tr>
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
                              <tr>
                                <td class="footer-left" align="left" valign="top" width="50%"
                                    style="font-size:9px;line-height:16px;color:#2B2B2B;font-weight:500;">
                                  <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="80" alt="Kahlo" title="Kahlo" /><br><br>
                                  Aguirre 540 2B<br>
                                  Buenos Aires<br>
                                  Argentina
                                </td>
                                <td class="footer-right social-links" align="right" valign="top" width="50%"
                                    style="text-align:right;">
                                  <a href="https://www.facebook.com/kahloagencia/" target="_blank">
                                    <img src="https://kahloagencia.com/2024/copaamerica/mailing/fb.png" alt="Facebook" title="Facebook" width="20"></a>&nbsp;&nbsp;
                                  <a href="https://www.instagram.com/kahloagencia" target="_blank">
                                    <img src="https://kahloagencia.com/2024/copaamerica/mailing/ig.png" alt="Instagram" title="Instagram" width="20"></a>&nbsp;&nbsp;
                                  <a href="https://wa.me/+5491132905198" target="_blank">
                                    <img src="https://kahloagencia.com/2024/copaamerica/mailing/wpp.png" alt="Whatsapp" title="Whatsapp" width="20"></a>&nbsp;&nbsp;
                                  <a href="https://www.linkedin.com/company/kahlo-agencia/" target="_blank">
                                    <img src="https://kahloagencia.com/2024/copaamerica/mailing/linkedin.png" alt="LinkedIn" title="LinkedIn" width="20"></a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td height="45" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                      </table>
                    </td>
                    <td width="8%"></td>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>';
}
