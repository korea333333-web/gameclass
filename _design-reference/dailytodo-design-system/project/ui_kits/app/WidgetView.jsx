// WidgetView.jsx — iOS notification-center widget showing the full task list.

function WidgetView({ time = '1:24', date = '5월 11일 토요일', tasks = [], onOpen, onAdd }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#F2EEE8',
      fontFamily: 'var(--font-sans, "Pretendard Variable", -apple-system, sans-serif)',
      paddingTop: 60, paddingBottom: 40,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Search */}
      <div style={{ padding: '0 12px' }}>
        <div style={{
          background: '#FAF7F2', borderRadius: 10, padding: '9px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <img src="../../assets/icons/magnifying-glass.svg"
               style={{ width: 16, height: 16, opacity: 0.42 }} />
          <span style={{ fontSize: 14, color: '#A89E94' }}>검색</span>
        </div>
      </div>

      {/* Clock + date right-aligned */}
      <div style={{ textAlign: 'right', padding: '0 24px' }}>
        <div style={{
          fontFamily: '"SF Pro Display", -apple-system, system-ui',
          fontSize: 64, fontWeight: 200, lineHeight: 1, color: '#3D3530',
          letterSpacing: '-0.04em',
        }}>{time}</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#3D3530', marginTop: 4 }}>{date}</div>
      </div>

      {/* Widget card */}
      <div style={{ padding: '0 12px' }}>
        <div style={{
          background: '#FAF7F2', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(60,40,30,0.04)',
        }}>
          {/* Widget header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="../../assets/icons/list.svg" style={{ width: 13, height: 13, opacity: 0.55 }} />
              <span style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
                color: '#6E635B', textTransform: 'uppercase',
              }}>DAILYTODO TODOLIST WIDGET</span>
            </div>
            <button style={{
              background: 'none', border: 'none', fontSize: 12, color: '#6E635B',
              cursor: 'pointer', padding: 4,
            }}>간략히 보기</button>
          </div>

          {/* Tasks */}
          {tasks.map((t, i) => <TaskRow key={i} {...t} />)}

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 14px 12px',
          }}>
            <button onClick={onOpen} style={cardBtnStyle}>앱 열기</button>
            <button onClick={onAdd} style={cardBtnStyle}>할 일 추가</button>
          </div>
        </div>

        {/* Edit (text button outside card) */}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button style={{
            background: 'none', border: 'none', fontSize: 13, color: '#6E635B',
            cursor: 'pointer', padding: '6px 14px',
          }}>편집</button>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ prefix, title, mark = 'O' }) {
  const colors = { 'O': '#6E635B', 'X': '#B5483A', '△': '#A89E94', '→': '#A89E94' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px',
      borderTop: '1px solid rgba(61,53,48,0.06)',
    }}>
      <span style={{ fontSize: 13.5, color: '#3D3530', fontWeight: 500 }}>
        <span style={{ color: '#A89E94', fontWeight: 400 }}>({prefix})</span> {title}
      </span>
      <span style={{ fontSize: 14, color: colors[mark] || '#A89E94' }}>{mark}</span>
    </div>
  );
}

const cardBtnStyle = {
  flex: 1, background: '#F7F3EC',
  border: '1px solid rgba(61,53,48,0.10)',
  borderRadius: 10, padding: '8px 0',
  fontSize: 13, fontWeight: 500, color: '#3D3530',
  cursor: 'pointer', fontFamily: 'inherit',
};

Object.assign(window, { WidgetView, TaskRow, cardBtnStyle });
