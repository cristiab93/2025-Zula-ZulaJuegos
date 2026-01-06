<?php
function AddedDeletedCollaboratorEmailBody($admin_name, $user, $legend)
{
    $rows = '';
    foreach ($user as $key => $value) {
        $rows .= '<tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:bold;color:#333;border-bottom:1px solid #e0e0e0;">'.$key.'</td><td style="padding:8px 12px;background:#ffffff;color:#555;border-bottom:1px solid #e0e0e0;">'.$value.'</td></tr>';
    }
    $year = date('Y');
    $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Notificación de baja</title>
<style type="text/css">
body {margin:0; padding:0; background-color:#f4f4f4; font-family:Helvetica, Arial, sans-serif; color:#333;}
table {border-collapse:collapse; width:100%;}
a {color:#2E86C1; text-decoration:none;}
@media only screen and (max-width:600px) {
  .wrapper {width:100% !important;}
}
</style>
</head>
<body>
<center style="padding:20px 0;">
  <table class="wrapper" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td style="background:#2E86C1; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:24px; color:#ffffff;">Hola {$admin_name}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;">
        <p style="font-size:16px; line-height:1.5; margin:0 0 20px;">{$legend}</p>
        <table>
          {$rows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f4f4f4; padding:16px; text-align:center; font-size:12px; color:#777;">
        &copy; {$year} Kahlo Agencia.
      </td>
    </tr>
  </table>
</center>
</body>
</html>
HTML;
    return $html;
}
?>
