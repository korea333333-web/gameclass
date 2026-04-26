// LockScreen.jsx — iOS lock screen with DAILYTODO notification cards.
// Uses the warm-paper wallpaper (--surface-1) instead of the iOS default photo.

function LockScreen({ time = '1:38', date = '5월 11일 토요일', notifications = [] }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#F2EEE8',
      display: 'flex', flexDirection: 'column',
      paddingTop: 80, fontFamily: 'var(--font-sans, "Pretendard Variable", -apple-system, sans-serif)',
    }}>
      {/* Clock */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{
          fontFamily: '"SF Pro Display", -apple-system, system-ui',
          fontSize: 88, fontWeight: 200, lineHeight: 1, color: '#3D3530',
          letterSpacing: '-0.04em',
        }}>{time}</div>
        <div style={{
          fontSize: 17, fontWeight: 500, color: '#3D3530',
          marginTop: 8, letterSpacing: '-0.01em',
        }}>{date}</div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Notifications */}
      <div style={{
        padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {notifications.map((n, i) => <LockNotification key={i} {...n} />)}
      </div>

      {/* Bottom shortcuts (flashlight & camera) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '0 30px 60px', alignItems: 'center',
      }}>
        <ShortcutPill icon="flashlight" />
        <ShortcutPill icon="camera" />
      </div>
    </div>
  );
}

function LockNotification({ title, body, time = '1분 전' }) {
  return (
    <div style={{
      background: '#FAF7F2', borderRadius: 14,
      padding: '12px 16px',
      boxShadow: '0 1px 2px rgba(60,40,30,0.04)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src="../../assets/icons/list.svg" style={{ width: 13, height: 13, opacity: 0.55 }} />
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
            color: '#6E635B', textTransform: 'uppercase',
          }}>DAILYTODO</span>
        </div>
        <span style={{ fontSize: 11, color: '#A89E94' }}>{time}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#3D3530', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#6E635B' }}>{body}</div>
    </div>
  );
}

function ShortcutPill({ icon }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: 'rgba(61,53,48,0.12)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={`../../assets/icons/${icon}.svg`} style={{
        width: 22, height: 22, opacity: 0.85,
        filter: 'invert(20%) sepia(7%) saturate(890%) hue-rotate(2deg)',
      }} />
    </div>
  );
}

Object.assign(window, { LockScreen, LockNotification, ShortcutPill });
