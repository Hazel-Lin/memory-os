import React from 'react';
import { ThreeColumnLayout } from './components/layout/ThreeColumnLayout';
import { Sidebar } from './components/layout/Sidebar';
import { MainPanel } from './components/layout/MainPanel';
import { InfoPanel } from './components/layout/InfoPanel';
import { ToastProvider } from './components/common/ToastProvider';
import { Loading } from './components/common/Loading';
import { useInitialize } from './hooks/useInitialize';
import { useMemoryStore } from './store/memoryStore';

function AppContent() {
  useInitialize();

  const data = useMemoryStore((state) => state.data);
  const loading = useMemoryStore((state) => state.loading);

  if (loading && !data) {
    return <Loading />;
  }

  return (
    <ThreeColumnLayout
      sidebar={<Sidebar />}
      main={<MainPanel />}
      info={<InfoPanel />}
    />
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
