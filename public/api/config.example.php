<?php
/**
 * Copy this file to config.php ON THE SERVER and fill in real values.
 * config.php is gitignored and blocked from direct web access by api/.htaccess.
 * Never commit config.php or put these values in the frontend .env.
 *
 * ADMIN_PASSWORD_HASH: generate with
 *   php -r "echo password_hash('your-long-password', PASSWORD_DEFAULT), PHP_EOL;"
 */
return [
    // Google reCAPTCHA v2 checkbox SECRET key (the site key goes in .env as VITE_RECAPTCHA_SITE_KEY)
    'RECAPTCHA_SECRET' => '',
    // Hostnames reCAPTCHA must report for a token to be accepted
    'RECAPTCHA_HOSTNAMES' => ['luvreno.net', 'www.luvreno.net'],
    // Where contact form messages and newsletter sign-ups are delivered
    'MAIL_TO' => '',
    // A fixed sender address on your own domain, for example no-reply@luvreno.net
    'MAIL_FROM' => '',
    // password_hash() output for the testimonial moderation page
    'ADMIN_PASSWORD_HASH' => '',
    // Any long random string, used to hash visitor IPs for rate limiting
    'IP_SALT' => '',
];
