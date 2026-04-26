export default function TasksPage() {
  return (
    <main>
      <header className="mb-8">
        <p className="dt-caps mb-2">TASKS</p>
        <h1 className="dt-h1">과제</h1>
      </header>

      <div className="dt-card">
        <p className="dt-task mb-2">등록된 과제가 없습니다</p>
        <p className="dt-secondary">
          이 화면은 Sprint 2에서 마감 카운트다운과 과목별 분류가 추가됩니다.
        </p>
      </div>
    </main>
  );
}
