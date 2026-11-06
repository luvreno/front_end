<?php
/**
 * GET  /api/testimonials.php   approved testimonials only, with ETag support
 * POST /api/testimonials.php   new submission, stored as pending (JSON)
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

const LV_STORE = 'testimonials.json';
const LV_MAX_PENDING = 200;

$method = lv_require_method(['GET', 'POST', 'HEAD']);

if ($method === 'GET' || $method === 'HEAD') {
    $data = lv_store_read(LV_STORE);
    $items = [];
    foreach ($data['items'] as $t) {
        if (!is_array($t) || ($t['status'] ?? '') !== 'approved') {
            continue;
        }
        // Public fields only. No email is ever collected or returned.
        $items[] = [
            'id' => (string)($t['id'] ?? ''),
            'name' => (string)($t['name'] ?? ''),
            'company' => (string)($t['company'] ?? ''),
            'role' => (string)($t['role'] ?? ''),
            'rating' => (int)($t['rating'] ?? 0),
            'message' => (string)($t['message'] ?? ''),
            'date' => substr((string)($t['approvedAt'] ?? $t['createdAt'] ?? ''), 0, 10),
        ];
    }
    $json = json_encode(['ok' => true, 'items' => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $etag = '"' . sha1((string)$json) . '"';
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache');
    header('ETag: ' . $etag);
    lv_security_headers();
    $inm = trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? ''));
    if ($inm !== '' && $inm === $etag) {
        http_response_code(304);
        exit;
    }
    if ($method === 'HEAD') {
        exit;
    }
    echo $json;
    exit;
}

/* ---------------------------------------------------------------- POST */
$in = lv_read_json();

if (isset($in['website']) && is_string($in['website']) && trim($in['website']) !== '') {
    lv_json(200, ['ok' => true, 'status' => 'pending']);
}

$name = lv_clean($in['name'] ?? '', 80);
$company = lv_clean($in['company'] ?? '', 80);
$role = lv_clean($in['role'] ?? '', 80);
$message = lv_clean($in['message'] ?? '', 600, true);
$rating = filter_var($in['rating'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 5]]);
$consent = ($in['consent'] ?? false) === true;

$errors = [];
if (lv_len($name) < 2) $errors[] = 'name';
if ($rating === false) $errors[] = 'rating';
if (lv_len($message) < 20) $errors[] = 'message';
if (!$consent) $errors[] = 'consent';
// Reject anything that looks like an email address or a link in public fields.
foreach (['name' => $name, 'company' => $company, 'role' => $role, 'message' => $message] as $k => $v) {
    if (preg_match('/[^\s@]+@[^\s@]+\.[a-z]{2,}/i', $v) || preg_match('~https?://|www\.~i', $v)) {
        $errors[] = $k;
    }
}
if ($errors) {
    lv_json(422, ['ok' => false, 'error' => 'Please check the highlighted fields. Links and email addresses are not allowed.', 'fields' => array_values(array_unique($errors))]);
}
if (!lv_rate_limit('testimonial', 5, 3600)) {
    header('Retry-After: 3600');
    lv_json(429, ['ok' => false, 'error' => 'Too many submissions. Please try again later.']);
}
if (!lv_verify_recaptcha((string)($in['recaptcha'] ?? ''))) {
    lv_json(400, ['ok' => false, 'error' => 'reCAPTCHA check failed. Please try again.']);
}

$entry = [
    'id' => bin2hex(random_bytes(8)),
    'status' => 'pending',
    'name' => $name,
    'company' => $company,
    'role' => $role,
    'rating' => (int)$rating,
    'message' => $message,
    'consent' => true,
    'createdAt' => gmdate('c'),
    'ipHash' => substr(lv_ip_hash(), 0, 16),
];

$result = lv_store_update(LV_STORE, function (array &$data) use ($entry) {
    $pending = 0;
    foreach ($data['items'] as $t) {
        if (($t['status'] ?? '') === 'pending') {
            $pending++;
        }
    }
    if ($pending >= LV_MAX_PENDING) {
        return 'full';
    }
    $data['items'][] = $entry;
    return 'ok';
});

if ($result === 'full') {
    lv_json(503, ['ok' => false, 'error' => 'We are not accepting new feedback right now. Please try again later.']);
}
if ($result !== 'ok') {
    lv_json(500, ['ok' => false, 'error' => 'Your feedback could not be saved. Please try again later.']);
}
lv_json(201, ['ok' => true, 'status' => 'pending']);
