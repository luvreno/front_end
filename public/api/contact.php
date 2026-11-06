<?php
/**
 * POST /api/contact.php  (JSON only)
 *   { type: "contact", name, email, company?, subject, message, recaptcha, website(honeypot) }
 *   { type: "newsletter", email, website(honeypot) }
 * Replies { ok: true } or { ok: false, error } with a matching status code.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

lv_require_method(['POST']);
$in = lv_read_json();
$type = ($in['type'] ?? 'contact') === 'newsletter' ? 'newsletter' : 'contact';

// Honeypot: pretend success so bots learn nothing.
if (isset($in['website']) && is_string($in['website']) && trim($in['website']) !== '') {
    lv_json(200, ['ok' => true]);
}

$mailTo = (string)lv_cfg('MAIL_TO');
$mailFrom = (string)lv_cfg('MAIL_FROM');
if (!lv_valid_email($mailTo) || !lv_valid_email($mailFrom)) {
    lv_json(503, ['ok' => false, 'error' => 'This form is not available right now.']);
}

if (!lv_rate_limit($type, 5, 600)) {
    header('Retry-After: 600');
    lv_json(429, ['ok' => false, 'error' => 'Too many requests. Please try again later.']);
}

$email = lv_header_safe(lv_clean($in['email'] ?? '', 254));
if (!lv_valid_email($email)) {
    lv_json(422, ['ok' => false, 'error' => 'Please enter a valid email address.']);
}

$host = 'luvreno.net';
$headers = [
    'From: Luvreno website <' . lv_header_safe($mailFrom) . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Luvreno',
];

if ($type === 'newsletter') {
    $subject = 'Newsletter sign-up';
    $body = "New newsletter sign-up from the {$host} website.\n\nEmail: {$email}\nTime (UTC): " . gmdate('Y-m-d H:i') . "\n";
} else {
    $allowedSubjects = [
        'General enquiry', 'Product walkthrough', 'Pricing question', 'Enterprise plan',
        'Dashboard support', 'Follow-up from the assistant', 'Other',
    ];
    $name = lv_header_safe(lv_clean($in['name'] ?? '', 100));
    $company = lv_header_safe(lv_clean($in['company'] ?? '', 120));
    $subjectIn = lv_header_safe(lv_clean($in['subject'] ?? '', 80));
    $message = lv_clean($in['message'] ?? '', 3000, true);

    $errors = [];
    if (lv_len($name) < 2) $errors[] = 'name';
    if (!in_array($subjectIn, $allowedSubjects, true)) $errors[] = 'subject';
    if (lv_len($message) < 10) $errors[] = 'message';
    if ($errors) {
        lv_json(422, ['ok' => false, 'error' => 'Please check the highlighted fields.', 'fields' => $errors]);
    }
    if (!lv_verify_recaptcha((string)($in['recaptcha'] ?? ''))) {
        lv_json(400, ['ok' => false, 'error' => 'reCAPTCHA check failed. Please try again.']);
    }
    $subject = 'Website enquiry: ' . $subjectIn;
    $body = "New message from the {$host} contact form.\n\n"
        . "Name: {$name}\n"
        . "Email: {$email}\n"
        . 'Company: ' . ($company !== '' ? $company : '(not given)') . "\n"
        . "Subject: {$subjectIn}\n"
        . 'Time (UTC): ' . gmdate('Y-m-d H:i') . "\n\n"
        . "Message:\n{$message}\n";
}

$encodedSubject = '=?UTF-8?B?' . base64_encode(lv_header_safe($subject)) . '?=';
$sent = @mail($mailTo, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $mailFrom);

if (!$sent) {
    lv_json(502, ['ok' => false, 'error' => 'Your message could not be sent. Please try again later.']);
}
lv_json(200, ['ok' => true]);
