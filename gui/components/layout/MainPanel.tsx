import React from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ProfileEditor } from '../profile/ProfileEditor';
import { ProjectList } from '../projects/ProjectList';
import { ProjectEditor } from '../projects/ProjectEditor';
import { InsightList } from '../insights/InsightList';
import { InsightEditor } from '../insights/InsightEditor';

export function MainPanel() {
  const currentView = useMemoryStore((state) => state.currentView);
  const selectedProjectId = useMemoryStore((state) => state.selectedProjectId);
  const selectedInsightId = useMemoryStore((state) => state.selectedInsightId);

  switch (currentView) {
    case 'profile':
      return <ProfileEditor />;

    case 'projects':
      return selectedProjectId ? <ProjectEditor /> : <ProjectList />;

    case 'insights':
      return selectedInsightId ? <InsightEditor /> : <InsightList />;

    default:
      return null;
  }
}
