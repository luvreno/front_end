<?php
/**
 * Testimonial moderation page. Password protected (hash in config.php),
 * HTTPS only, CSRF token on every action, lockout after 5 failed logins in 15 minutes.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

const LV_STORE = 'testimonials.json';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");

if (!lv_is_https() && !lv_is_local()) {
    http_response_code(403);
    echo 'HTTPS is required.';
    exit;
}

$hash = (string)lv_cfg('ADMIN_PASSWORD_HASH');
if ($hash === '') {
    http_response_code(503);
    echo 'Moderation is not configured. Create api/config.php from config.example.php.';
    exit;
}

session_name('lv_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => dirname($_SERVER['SCRIPT_NAME'] ?? '/api/') . '/',
    'secure' => !lv_is_local(),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

function h($v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_ok(): bool
{
    $t = (string)($_POST['csrf'] ?? '');
    return $t !== '' && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t);
}

/** Failed login tracking: 5 failures per hashed IP within 15 minutes locks the form. */
function login_attempts(bool $record = false, bool $clear = false): int
{
    $file = lv_data_dir() . '/login-attempts.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return 0;
    }
    flock($fh, LOCK_EX);
    $all = json_decode(stream_get_contents($fh) ?: '{}', true);
    $all = is_array($all) ? $all : [];
    $now = time();
    $key = substr(lv_ip_hash(), 0, 24);
    foreach ($all as $k => $times) {
        $all[$k] = array_values(array_filter((array)$times, fn($t) => (int)$t > $now - 900));
        if (!$all[$k]) unset($all[$k]);
    }
    if ($clear) unset($all[$key]);
    if ($record) $all[$key][] = $now;
    $count = count($all[$key] ?? []);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($all));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $count;
}

$flash = '';
$action = (string)($_POST['action'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok()) {
        http_response_code(400);
        $flash = 'Your session expired. Please try again.';
    } elseif ($action === 'login') {
        if (login_attempts() >= 5) {
            http_response_code(429);
            $flash = 'Too many failed attempts. Try again in 15 minutes.';
        } elseif (password_verify((string)($_POST['password'] ?? ''), $hash)) {
            login_attempts(false, true);
            session_regenerate_id(true);
            $_SESSION['admin'] = true;
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'), true, 303);
            exit;
        } else {
            $n = login_attempts(true);
            usleep(400000);
            $flash = $n >= 5 ? 'Too many failed attempts. Try again in 15 minutes.' : 'That password is not correct.';
        }
    } elseif ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'), true, 303);
        exit;
    } elseif (!empty($_SESSION['admin']) && in_array($action, ['approve', 'reject', 'delete'], true)) {
        $id = preg_replace('/[^a-f0-9]/', '', (string)($_POST['id'] ?? ''));
        $ok = lv_store_update(LV_STORE, function (array &$data) use ($id, $action) {
            foreach ($data['items'] as $i => $t) {
                if (($t['id'] ?? '') !== $id) continue;
                if ($action === 'delete') {
                    array_splice($data['items'], $i, 1);
                } else {
                    $data['items'][$i]['status'] = $action === 'approve' ? 'approved' : 'rejected';
                    $data['items'][$i][$action === 'approve' ? 'approvedAt' : 'rejectedAt'] = gmdate('c');
                }
                return true;
            }
            return false;
        });
        $_SESSION['flash'] = $ok ? 'Saved.' : 'That item could not be found.';
        header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'), true, 303);
        exit;
    }
}

if (!empty($_SESSION['flash'])) {
    $flash = (string)$_SESSION['flash'];
    unset($_SESSION['flash']);
}
$authed = !empty($_SESSION['admin']);
$items = $authed ? lv_store_read(LV_STORE)['items'] : [];
$groups = ['pending' => [], 'approved' => [], 'rejected' => []];
foreach ($items as $t) {
    $s = $t['status'] ?? 'pending';
    if (isset($groups[$s])) $groups[$s][] = $t;
}
$token = csrf();
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Feedback moderation | Luvreno</title>
<style>
  :root { --c1:#161616; --c2:#346751; --c4:#ECDBBA; }
  * { box-sizing: border-box; }
  body { margin:0; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--c4); color: var(--c1); }
  main { max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
  header { display:flex; justify-content:space-between; align-items:center; gap:16px; border-bottom:1px solid rgba(22,22,22,.2); padding-bottom:12px; margin-bottom:24px; }
  h1 { font-size: 1.5rem; margin: 0; }
  h2 { font-size: 1.2rem; margin: 32px 0 12px; }
  .card { border:1px solid rgba(22,22,22,.2); border-radius:16px; padding:16px; margin-bottom:12px; }
  .meta { font-family: ui-monospace, monospace; font-size: .875rem; }
  form.inline { display:inline; }
  button, input[type=password] { font: inherit; min-height: 44px; border-radius: 999px; padding: 8px 18px; border: 1.5px solid var(--c1); }
  button { background: var(--c4); color: var(--c1); cursor: pointer; }
  button.primary { background: var(--c2); color: var(--c4); border-color: var(--c2); }
  button:focus-visible, input:focus-visible { outline: 3px solid var(--c1); outline-offset: 2px; }
  .flash { padding: 12px 16px; border: 2px solid var(--c1); border-radius: 12px; margin-bottom: 16px; }
  .actions { display:flex; gap:8px; flex-wrap:wrap; margin-top: 12px; }
  label { display:block; font-weight:600; margin-bottom:6px; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Feedback moderation</h1>
    <?php if ($authed): ?>
      <form method="post" class="inline">
        <input type="hidden" name="csrf" value="<?= h($token) ?>">
        <input type="hidden" name="action" value="logout">
        <button type="submit">Log out</button>
      </form>
    <?php endif; ?>
  </header>

  <?php if ($flash !== ''): ?><p class="flash" role="status"><?= h($flash) ?></p><?php endif; ?>

  <?php if (!$authed): ?>
    <form method="post" autocomplete="off">
      <input type="hidden" name="csrf" value="<?= h($token) ?>">
      <input type="hidden" name="action" value="login">
      <label for="password">Admin password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password">
      <button class="primary" type="submit">Log in</button>
    </form>
  <?php else: ?>
    <?php foreach (['pending' => 'Pending', 'approved' => 'Approved (public)', 'rejected' => 'Rejected'] as $key => $label): ?>
      <h2><?= h($label) ?> (<?= count($groups[$key]) ?>)</h2>
      <?php if (!$groups[$key]): ?><p>None.</p><?php endif; ?>
      <?php foreach ($groups[$key] as $t): ?>
        <article class="card">
          <p class="meta"><?= h($t['createdAt'] ?? '') ?> · rating <?= (int)($t['rating'] ?? 0) ?>/5 · id <?= h($t['id'] ?? '') ?></p>
          <p><strong><?= h($t['name'] ?? '') ?></strong><?= !empty($t['role']) ? ', ' . h($t['role']) : '' ?><?= !empty($t['company']) ? ', ' . h($t['company']) : '' ?></p>
          <p><?= nl2br(h($t['message'] ?? '')) ?></p>
          <div class="actions">
            <?php foreach (($key === 'approved' ? ['reject', 'delete'] : ($key === 'rejected' ? ['approve', 'delete'] : ['approve', 'reject', 'delete'])) as $act): ?>
              <form method="post" class="inline">
                <input type="hidden" name="csrf" value="<?= h($token) ?>">
                <input type="hidden" name="action" value="<?= h($act) ?>">
                <input type="hidden" name="id" value="<?= h($t['id'] ?? '') ?>">
                <button type="submit" class="<?= $act === 'approve' ? 'primary' : '' ?>"><?= h(ucfirst($act)) ?></button>
              </form>
            <?php endforeach; ?>
          </div>
        </article>
      <?php endforeach; ?>
    <?php endforeach; ?>
  <?php endif; ?>
</main>
</body>
</html>
