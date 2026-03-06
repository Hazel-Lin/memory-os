import React from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ProfileInfoPanel } from '../profile/ProfileInfoPanel';
import { ProjectInfoPanel } from '../projects/ProjectInfoPanel';
import { InsightInfoPanel } from '../insights/InsightInfoPanel';

export function InfoPanel() {
  const currentView = useMemoryStore((state) => state.currentView);

  switch (currentView) {
    case 'profile':
      return <ProfileInfoPanel />;

    case 'projects':
      return <ProjectInfoPanel />;

    case 'insights':
      return <InsightInfoPanel />;

    default:
      return null;
  }
}
