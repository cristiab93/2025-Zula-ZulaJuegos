<?php

function PasswordRecoveryEmailBody($password)
{
    return 'Tu password es: ' . $password;
}