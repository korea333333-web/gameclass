// AppView.jsx — In-app calendar + task list view.

function AppView({ tasks, onTaskCycle, onAddTask }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#F2EEE8',
      fontFamily: 'var(--font-sans, "Pretendard Variable", -apple-system, sans-serif)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56, paddingBottom: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 24px 12px',
      }}>
        <div style={{ width: 40 }} />
        <div style={{ fontSize: 16, fontWeight: 500, color: '#3D3530' }}>2019년 06월</div>
        <button style={{
          background: 'none', border: 'none', fontSize: 13, color: '#6E635B',
          fontFamily: 'inherit', cursor: 'pointer',
        }}>편집</button>
      </div>

      {/* Calendar strip */}
      <CalendarStrip selectedDay={10} />

      {/* Quote */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          background: '#F7F3EC', padding: '12px 14px', borderRadius: 6,
        }}>
          <p style={{
            margin: '0 0 4px', fontSize: 12, lineHeight: 1.6, color: '#6E635B',
          }}>지혜는 학교에서 배우는 것이 아니라 평생 노력해 얻는 것이다</p>
          <p style={{
            margin: 0, fontSize: 12, lineHeight: 1.6, color: '#6E635B', opacity: 0.78,
          }}>Wisdom is not a product of schooling, but of the life-long attempt to acquire it</p>
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 0' }}>
        {tasks.map((t, i) => (
          <AppTaskRow key={i} {...t} onCycle={() => onTaskCycle(i)} />
        ))}
      </div>

      {/* FAB */}
      <button onClick={onAddTask} style={{
        position: 'absolute', right: 18, bottom: 78,
        width: 44, height: 44, borderRadius: '50%',
        background: '#FAF7F2',
        border: '1px solid rgba(61,53,48,0.06)',
        boxShadow: '0 4px 14px rgba(60,40,30,0.10), 0 1px 2px rgba(60,40,30,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <img src="../../assets/icons/plus.svg" style={{ width: 22, height: 22 }} />
      </button>

      {/* Tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '12px 24px 22px', background: '#FAF7F2',
        borderTop: '1px solid rgba(61,53,48,0.06)',
      }}>
        <button style={tabBtn(true)}>
          <img src="../../assets/icons/calendar-blank.svg" style={{ width: 22, height: 22 }} />
        </button>
        <button style={tabBtn(false)}>
          <img src="../../assets/icons/gear.svg" style={{ width: 22, height: 22, opacity: 0.42 }} />
        </button>
      </div>
    </div>
  );
}

function CalendarStrip({ selectedDay }) {
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  const days = [9, 10, 11, 12, 13, 14, 15];
  const dotted = [9, 13, 14];
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
        {dows.map(d => (
          <div key={d} style={{ fontSize: 11, color: '#A89E94', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
        {days.map(d => {
          const sel = d === selectedDay;
          return (
            <div key={d} style={{
              padding: '6px 0', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: sel ? '#3D3530' : 'transparent',
                color: sel ? '#FAF7F2' : '#3D3530',
                fontSize: 15, fontWeight: sel ? 500 : 400,
              }}>{d}</span>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: dotted.includes(d) ? '#A89E94' : 'transparent',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AppTaskRow({ prefix, title, mark = 'O', onCycle }) {
  const colors = { 'O': '#6E635B', 'X': '#B5483A', '△': '#A89E94', '→': '#A89E94' };
  return (
    <div onClick={onCycle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 20px',
      borderBottom: '1px solid rgba(61,53,48,0.05)',
      cursor: 'pointer',
    }}>
      <span style={{ fontSize: 14, color: '#3D3530', fontWeight: 500 }}>
        <span style={{ color: '#A89E94', fontWeight: 400 }}>({prefix})</span> {title}
      </span>
      <span style={{ fontSize: 14, color: colors[mark] || '#A89E94', minWidth: 16, textAlign: 'right' }}>{mark}</span>
    </div>
  );
}

function tabBtn(active) {
  return {
    width: 44, height: 44, border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: active ? 1 : 1,
  };
}

Object.assign(window, { AppView, CalendarStrip, AppTaskRow });
