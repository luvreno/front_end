<?php
/**
 * Luvreno API helpers. Included by the endpoints; never called directly.
 */
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') {
    http_response_code(404);
    exit;
}

const LV_MAX_BODY = 10240; // 10 KB

function lv_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $file = __DIR__ . '/config.php';
    if (!is_file($file)) {
        $cfg = [];
        return $cfg;
    }
    $loaded = require $file;
    $cfg = is_array($loaded) ? $loaded : [];
    return $cfg;
}

function lv_cfg(string $key, $default = '')
{
    $c = lv_config();
    return array_key_exists($key, $c) && $c[$key] !== '' ? $c[$key] : $default;
}

function lv_security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: DENY');
    header('X-Robots-Tag: noindex, nofollow');
}

/** Sends a JSON reply and stops. Never includes internal details. */
function lv_json(int $status, array $data): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    lv_security_headers();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lv_require_method(array $allowed): string
{
    $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($m, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        lv_json(405, ['ok' => false, 'error' => 'Method not allowed.']);
    }
    return $m;
}

/** Reads a JSON object body, enforcing content type and a size cap. */
function lv_read_json(): array
{
    $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
    if (strpos($type, 'application/json') !== 0) {
        lv_json(415, ['ok' => false, 'error' => 'Expected JSON.']);
    }
    $len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len > LV_MAX_BODY) {
        lv_json(413, ['ok' => false, 'error' => 'Request too large.']);
    }
    $raw = file_get_contents('php://input', false, null, 0, LV_MAX_BODY + 1);
    if ($raw === false || strlen($raw) > LV_MAX_BODY) {
        lv_json(413, ['ok' => false, 'error' => 'Request too large.']);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        lv_json(400, ['ok' => false, 'error' => 'Invalid request.']);
    }
    return $data;
}

/** Trims, removes control characters and caps the length (in characters). */
function lv_clean($value, int $max, bool $multiline = false): string
{
    if (!is_string($value)) {
        return '';
    }
    $v = $multiline
        ? preg_replace('/[^\P{C}\n]/u', '', str_replace("\r\n", "\n", $value))
        : preg_replace('/\p{C}/u', '', $value);
    $v = trim((string)$v);
    if (function_exists('mb_substr')) {
        return mb_substr($v, 0, $max, 'UTF-8');
    }
    return substr($v, 0, $max);
}

function lv_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Removes anything that could split a mail header. */
function lv_header_safe(string $s): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], ' ', $s));
}

function lv_client_ip(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function lv_ip_hash(): string
{
    $salt = (string)lv_cfg('IP_SALT', 'luvreno-default-salt');
    return hash('sha256', $salt . '|' . lv_client_ip());
}

/**
 * Sliding-window rate limit by hashed IP, stored in temp files.
 * Returns true when the request is allowed.
 */
function lv_rate_limit(string $bucket, int $max, int $windowSeconds): bool
{
    $dir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'luvreno-rl';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . DIRECTORY_SEPARATOR . preg_replace('/[^a-z0-9_-]/i', '', $bucket) . '-' . lv_ip_hash() . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return true; // fail open rather than block real visitors if temp is unavailable
    }
    flock($fh, LOCK_EX);
    $now = time();
    $raw = stream_get_contents($fh);
    $hits = json_decode($raw ?: '[]', true);
    $hits = is_array($hits) ? array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - $windowSeconds)) : [];
    $allowed = count($hits) < $max;
    if ($allowed) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $allowed;
}

/** Verifies a reCAPTCHA v2 token server-side, including the hostname. */
function lv_verify_recaptcha(string $token): bool
{
    $secret = (string)lv_cfg('RECAPTCHA_SECRET');
    if ($secret === '' || $token === '' || strlen($token) > 4000) {
        return false;
    }
    $post = http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => lv_client_ip()]);
    $body = false;
    if (function_exists('curl_init')) {
        $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $post,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $body = curl_exec($ch);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $post,
            'timeout' => 8,
        ]]);
        $body = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $ctx);
    }
    if (!is_string($body)) {
        return false;
    }
    $r = json_decode($body, true);
    if (!is_array($r) || empty($r['success'])) {
        return false;
    }
    $allowedHosts = (array)lv_cfg('RECAPTCHA_HOSTNAMES', ['luvreno.net', 'www.luvreno.net']);
    return isset($r['hostname']) && in_array(strtolower((string)$r['hostname']), array_map('strtolower', $allowedHosts), true);
}

function lv_valid_email(string $email): bool
{
    return strlen($email) <= 254 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/* ---------------------------------------------------------- JSON file store */

function lv_data_dir(): string
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $ht = $dir . '/.htaccess';
    if (!is_file($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    }
    return $dir;
}

/** Reads a JSON store under a shared lock. */
function lv_store_read(string $name): array
{
    $file = lv_data_dir() . '/' . $name;
    if (!is_file($file)) {
        return ['items' => []];
    }
    $fh = @fopen($file, 'r');
    if (!$fh) {
        return ['items' => []];
    }
    flock($fh, LOCK_SH);
    $raw = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    $data = json_decode($raw ?: '', true);
    if (!is_array($data) || !isset($data['items']) || !is_array($data['items'])) {
        return ['items' => []];
    }
    return $data;
}

/**
 * Updates a JSON store atomically: exclusive lock on a lock file,
 * write to a temp file, then rename over the original.
 */
function lv_store_update(string $name, callable $fn)
{
    $dir = lv_data_dir();
    $lock = @fopen($dir . '/' . $name . '.lock', 'c');
    if (!$lock) {
        return false;
    }
    flock($lock, LOCK_EX);
    try {
        $data = lv_store_read($name);
        $result = $fn($data);
        if ($result === false) {
            return false;
        }
        $tmp = $dir . '/.' . $name . '.' . bin2hex(random_bytes(6)) . '.tmp';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if ($json === false || file_put_contents($tmp, $json, LOCK_EX) === false) {
            @unlink($tmp);
            return false;
        }
        if (!@rename($tmp, $dir . '/' . $name)) {
            @unlink($tmp);
            return false;
        }
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function lv_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https') {
        return true;
    }
    return (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function lv_is_local(): bool
{
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    return (bool)preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/', $host);
}
