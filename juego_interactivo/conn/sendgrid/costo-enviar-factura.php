<?php

function CostoEnviarFacturaEmailBody($provider_name, $fc_number, $fc_date, $method_payment)
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
      @import url(\'https://fonts.googleapis.com/css2?family=Work+Sans:wght@500,700&display=swap\');
  
  
      #Table_01 {
        width: 100% !important;
      }
  
      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background: #ffffff !important;
        font-family: \'Work Sans\', Arial, sans-serif;
      }
  
      :root {
        color-scheme: light;
        supported-color-schemes: light;
      }
  
      #outlook a {
        padding: 0;
      }
  
      table {
        border-spacing: 0;
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
  
      .ExternalClass {
        width: 100%;
      }
  
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
  
      .ReadMsgBody {
        width: 100%;
        background-color: #ebebeb;
      }
  
      table {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      img {
        -ms-interpolation-mode: bicubic;
        border: none;
      }
  
  
      @media screen and (max-width: 480px) {
        .w60 {
          width: 47% !important;
        }
  
        .w90 {
          width: 90% !important;
        }
  
        .title-bonificado {
          font-size: 30px !important;
        }
  
        .force-row,
        .container {
          width: 100% !important;
          max-width: 100% !important;
        }
  
        .mb-center {
          text-align: center !important;
        }
  
        .m-auto {
          margin: 0 auto;
        }
  
        .text-mobile {
          font-size: 9px !important;
        }
  
        .font-iconos {
          font-size: 10px !important;
          line-height: 12px !important
        }
  
        .bajada-mobile {
          font-size: 13px !important;
          line-height: 20px !important
        }
  
        .font14 {
          font-size: 15px !important;
          line-height: 19px !important;
        }
  
        .font16 {
          font-size: 20px !important;
          line-height: 28px !important
        }
  
        .subtitle {
          font-size: 21px !important;
          line-height: 29px !important;
        }
  
        .title {
          font-size: 29px !important;
          line-height: 31px !important;
        }
  
        .btn-mobile {
          font-size: 14px !important;
        }
  
        .mt20mob {
          margin-top: 20px;
        }
  
        p {
          font-size: 11px !important;
        }
  
        .h35 {
          height: 35px !important
        }
  
        .w100mob {
          width: 100% !important;
          display: block !important;
          margin-bottom: 15px !important
        }
  
        .imgcomun {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
  
        .txt-icono {
          font-size: 16px !important;
          line-height: 22px !important;
        }
  
        .title-icono {
          font-size: 15px !important;
          line-height: 21px !important;
        }
  
        .br-hide {
          display: none
        }
  
        .nave {
          display: block !important;
          margin: 0 auto !important;
        }
      }
    </style>
  </head>
  
  <body style="margin:0; padding:0; text-decoration: none !important;" bgcolor="#ffffff" leftmargin="0" topmargin="0"
    marginwidth="0" marginheight="0">
    <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
      style="text-decoration:none !important;">
      <tbody>
        <tr>
          <td align="center" valign="top" bgcolor="#ffffff" style="text-decoration:none !important;">
            <table border="0" width="600" cellpadding="0" cellspacing="0" class="container"
              style="width:600px;max-width:600px; text-decoration:none; text-decoration:none; background-color:#ffffff; overflow: hidden;
              box-sizing: border-box; margin-left: auto; margin-right: auto; padding: 0; border: 1px solid #dddddd;
              border-radius: 12px;" bgcolor="#ffffff">
  
             
             
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
                          <td align="left"><img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="83" alt="Kahlo" title="Kahlo" /></td>
  
                        </tr>
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
                        <tr>
                          <td align="left"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:16px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: left; text-transform: uppercase;"
                            valign="top">IMPORTANTE
                          </td>
                        </tr>
  
                        <tr>
                          <td height="20" style="font-size:1px;line-height:1px;"></td>
                        </tr>
  
  
                        <!-- PARRAFO -->
                        <tr>
                          <td align="left" class="font16"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:31px;line-height:35px;color:#2B2B2B;font-weight: bold; text-align: left"
                            valign="top">Fue abonada la siguiente factura
                          </td>
                        </tr>
  
                        <tr>
                          <td height="35" style="font-size:1px;line-height:1px;"></td>
                        </tr>
  
  
                        
  
                        <tr>
                          <td style="background-color: #d7f3e0; border-radius:12px" bgcolor="#d7f3e0">
                            <table align="center" width="90%" cellpadding="0" cellspacing="0" border="0"
                            style="border-collapse: collapse; border-radius: 13px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"> 
                            <tr>
                            <td height="30" style="font-size:1px;line-height:1px;"></td>
                            </tr>
                            <tr>
                            <td align="center"
                            style="font-family:\'Work Sans\', Arial, sans-serif;font-size:24px;line-height:32px;color:#2B2B2B;font-weight: bold; text-align: center">'.$provider_name.'</td>
                            </tr>
                            <tr>
                            <td height="15" style="font-size:1px;line-height:1px;"></td>
                            </tr>
                            <tr>
                              <td align="center"
                              style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: center">Factura Número: '.$fc_number.'</td>
                              </tr>
                              <tr>
                                <td height="8" style="font-size:1px;line-height:1px;"></td>
                                </tr>
                                <tr>
                                  <td align="center"
                                  style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: center">Fecha de pago: '.$fc_date.'</td>
                                  </tr>
                                  <tr>
                                    <td height="8" style="font-size:1px;line-height:1px;"></td>
                                    </tr>
                                    <tr>
                                      <td align="center"
                                      style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: center">Método de pago: '.$method_payment.'</td>
                                      </tr>
                                      <tr>
                                        <td height="30" style="font-size:1px;line-height:1px;"></td>
                                        </tr>
                            </table>
                          </td>
                        </tr>
  
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
  
                        <tr>
                          <td height="20" style="border-bottom: 1px solid #C4C4C4"></td>
                        </tr>
  
                        <tr>
                          <td height="40" style="font-size:1px;line-height:1px;"></td>
                        </tr>
  
                        <tr>
                          <td>
                            <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="40%" valign="top"
                                  style="font-family:\'Work Sans\', Arial, sans-serif;font-size:10px;line-height:16px;color:#2B2B2B;font-weight: 500; text-align: left">
                                  <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="80" alt="Kahlo" title="Kahlo" /><br><br>
                                  Aguirre 540 2B<br>
                                  Buenos Aires<br>
                                  Argentina
                                </td>
  
                                <td width="60%" valign="top" style="text-align: right">
                                  <a href="https://www.facebook.com/kahloagencia/" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/fb.png" alt="Facebook BuenaTuya"
                                      title="Facebook" width="20"></a>&nbsp;&nbsp;<a
                                    href="https://www.instagram.com/kahloagencia" target="_blank"><img
                                      src="https://kahloagencia.com/2024/copaamerica/mailing/ig.png" alt="Instagram"
                                      title="Instagram" width="20"></a>&nbsp;&nbsp;<a
                                      href="https://wa.me/+5491132905198" target="_blank"><img
                                        src="https://kahloagencia.com/2024/copaamerica/mailing/wpp.png" alt="Whatsapp"
                                        title="Whatsapp" width="20"></a>&nbsp;&nbsp;<a
                                        href="https://www.linkedin.com/company/kahlo-agencia/" target="_blank"><img
                                          src="https://kahloagencia.com/2024/copaamerica/mailing/linkedin.png" alt="Linkedin"
                                          title="Linkedin" width="20"></a>
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