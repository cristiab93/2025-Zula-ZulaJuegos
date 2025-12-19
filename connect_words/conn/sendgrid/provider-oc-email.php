<?php

function ProviderOCEmail($provider_name, $oc, $project, $price, $cost_id)
{
    $cta = 'https://somoskahlo.com/carga-tu-factura.php?id=' . rawurlencode($cost_id);

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
        @import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@500,700&display=swap");
        #Table_01 { width: 100% !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background: #ffffff !important; font-family: \'Work Sans\', Arial, sans-serif; }
        :root { color-scheme: light; supported-color-schemes: light; }
        #outlook a { padding: 0; }
        table { border-spacing: 0; }
        table td { border-collapse: collapse; }
        .imgcomun { border: 0; max-width: 100%; height: auto; display: block; }
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
        .ReadMsgBody { width: 100%; background-color: #ebebeb; }
        table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: none; }
        @media screen and (max-width: 480px) {
          .w60 { width: 47% !important; }
          .w90 { width: 90% !important; }
          .force-row, .container { width: 100% !important; max-width: 100% !important; }
          .mb-center { text-align: center !important; }
          .m-auto { margin: 0 auto; }
          .text-mobile { font-size: 9px !important; }
          .font-iconos { font-size: 10px !important; line-height: 12px !important }
          .bajada-mobile { font-size: 13px !important; line-height: 20px !important }
          .font14 { font-size: 15px !important; line-height: 19px !important; }
          .font16 { font-size: 20px !important; line-height: 28px !important }
          .subtitle { font-size: 21px !important; line-height: 29px !important; }
          .title { font-size: 29px !important; line-height: 31px !important; }
          .btn-mobile { font-size: 14px !important; }
          .mt20mob { margin-top: 20px; }
          p { font-size: 11px !important; }
          .h35 { height: 35px !important }
          .w100mob { width: 100% !important; display: block !important; margin-bottom: 15px !important }
          .imgcomun { max-width: 100% !important; height: auto !important; display: block !important; }
          .txt-icono { font-size: 16px !important; line-height: 22px !important; }
          .title-icono { font-size: 15px !important; line-height: 21px !important; }
          .br-hide { display: none }
          .nave { display: block !important; margin: 0 auto !important; }
        }
      </style>
    </head>
    
    <body style="margin:0; padding:0; text-decoration: none !important;" bgcolor="#ffffff" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
      <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="text-decoration:none !important;">
        <tbody>
          <tr>
            <td align="center" valign="top" bgcolor="#ffffff" style="text-decoration:none !important;">
              <table border="0" width="600" cellpadding="0" cellspacing="0" class="container" style="width:600px;max-width:600px; background-color:#ffffff; overflow: hidden; box-sizing: border-box; margin-left: auto; margin-right: auto; padding: 0; border: 1px solid #dddddd; border-radius: 12px;" bgcolor="#ffffff">
                <tr>
                  <td width="100%">
                    <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="8%"></td>
                        <td width="84%">
                          <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                            <tr><td width="100%" height="35"></td></tr>
                            <tr><td align="left"><img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="83" alt="Kahlo" title="Kahlo" /></td></tr>
                            <tr><td height="40" style="font-size:1px;line-height:1px;"></td></tr>
                            <tr>
                              <td align="left" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:16px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: left; text-transform: uppercase;" valign="top">IMPORTANTE</td>
                            </tr>
                            <tr><td height="20" style="font-size:1px;line-height:1px;"></td></tr>
                            <tr>
                              <td align="left" class="font16" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:33px;line-height:38px;color:#2B2B2B;font-weight: bold; text-align: left" valign="top">Hay un trabajo tuyo listo para facturar. Subilo ac&aacute;.</td>
                            </tr>
                            <tr><td height="25" style="font-size:1px;line-height:1px;"></td></tr>
                            <tr>
                              <td align="left" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:16px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: left">
                                Ya pod&eacute;s facturar sin mails ni demoras.<br><strong>Hacelo vos mismo, desde nuestro nuevo sistema.</strong>
                              </td>
                            </tr>
                            <tr><td height="20" style="font-size:1px;line-height:1px;"></td></tr>
                            <tr><td height="20" style="font-size:1px;line-height:1px;"></td></tr>

                            <tr>
                              <td>
                                <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td width="46%" valign="top" class="w100mob" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:15px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: left">Activamos un sistema para que subas tus facturas f&aacute;cil y directo.</td>
                                    <td width="8%" class="w100mob"></td>
                                    <td width="46%" valign="top" class="w100mob" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:15px;line-height:23px;color:#2B2B2B;font-weight: 500; text-align: left">Us&aacute; esta orden de compra y carg&aacute; el comprobante desde el bot&oacute;n.</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr><td height="55" style="font-size:1px;line-height:1px;"></td></tr>

                            <tr>
                              <td style="background-color:#d7f3e0; border-radius:12px;" bgcolor="#d7f3e0">
                                <table align="center" width="90%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                                  <tr><td height="30" style="font-size:1px;line-height:1px;"></td></tr>
                                  <tr>
                                    <td align="center" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:24px;line-height:32px;color:#2B2B2B;font-weight:bold; text-align:center">'.$provider_name.'</td>
                                  </tr>
                                  <tr><td height="15" style="font-size:1px;line-height:1px;"></td></tr>
                                  <tr>
                                    <td align="center" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight:500; text-align:center">OC: '.$oc.'</td>
                                  </tr>
                                  <tr><td height="8" style="font-size:1px;line-height:1px;"></td></tr>
                                  <tr>
                                    <td align="center" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight:500; text-align:center">'.$project.'</td>
                                  </tr>
                                  <tr><td height="8" style="font-size:1px;line-height:1px;"></td></tr>
                                  <tr>
                                    <td align="center" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:18px;line-height:23px;color:#2B2B2B;font-weight:500; text-align:center">MONTO SIN IVA: $'.$price.'</td>
                                  </tr>
                                  <tr><td height="24" style="font-size:1px;line-height:1px;"></td></tr>

                                  <tr>
                                    <td align="center">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                                        <tr>
                                          <td align="center" bgcolor="#2b2b2b" style="border-radius:8px;">
                                            <a href="'.$cta.'" target="_blank" style="display:block; padding:14px 30px; font-family:\'Work Sans\', Arial, sans-serif; font-size:16px; font-weight:500; color:#ffffff; text-decoration:none;">
                                              Sub&iacute; tu factura desde ac&aacute;
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>

                                  <tr><td height="32" style="font-size:1px;line-height:1px;"></td></tr>
                                </table>
                              </td>
                            </tr>

                            <tr><td height="40" style="font-size:1px;line-height:1px;"></td></tr>

                            <tr>
                              <td>
                                <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td width="46%" valign="top" class="w100mob" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:15px;line-height:23px;color:#2B2B2B;font-weight:500; text-align:left">Record&aacute; que los pagos se realizan a 30 dias de presentada la factura.</td>
                                    <td width="8%" class="w100mob"></td>
                                    <td width="46%" valign="top" class="w100mob" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:15px;line-height:23px;color:#2B2B2B;font-weight:500; text-align:left">Si hay algo mal en esta orden, hablalo con quien te hizo el pedido.</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr><td height="40" style="font-size:1px;line-height:1px;"></td></tr>
                            <tr><td height="20" style="border-bottom:1px solid #C4C4C4"></td></tr>
                            <tr><td height="40" style="font-size:1px;line-height:1px;"></td></tr>

                            <tr>
                              <td>
                                <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td width="40%" valign="top" style="font-family:\'Work Sans\', Arial, sans-serif;font-size:10px;line-height:16px;color:#2B2B2B;font-weight:500; text-align:left">
                                      <img src="https://kahloagencia.com/2024/copaamerica/mailing/logo.png" width="80" alt="Kahlo" title="Kahlo" /><br><br>
                                      Aguirre 540 2B<br>Buenos Aires<br>Argentina
                                    </td>
                                    <td width="60%" valign="top" style="text-align:right">
                                      <a href="https://www.facebook.com/kahloagencia/" target="_blank"><img src="https://kahloagencia.com/2024/copaamerica/mailing/fb.png" alt="Facebook BuenaTuya" title="Facebook" width="20"></a>&nbsp;&nbsp;
                                      <a href="https://www.instagram.com/kahloagencia" target="_blank"><img src="https://kahloagencia.com/2024/copaamerica/mailing/ig.png" alt="Instagram" title="Instagram" width="20"></a>&nbsp;&nbsp;
                                      <a href="https://wa.me/+5491132905198" target="_blank"><img src="https://kahloagencia.com/2024/copaamerica/mailing/wpp.png" alt="Whatsapp" title="Whatsapp" width="20"></a>&nbsp;&nbsp;
                                      <a href="https://www.linkedin.com/company/kahlo-agencia/" target="_blank"><img src="https://kahloagencia.com/2024/copaamerica/mailing/linkedin.png" alt="Linkedin" title="Linkedin" width="20"></a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr><td height="45" style="font-size:1px;line-height:1px;"></td></tr>
                          </table>
                        </td>
                        <td width="8%"></td>
                      </tr>
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
