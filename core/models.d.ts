export interface WritingStyle {
    tone: string;
    preferredStructures: string[];
    avoid: string[];
}
export interface Capabilities {
    business_judgment: number;
    writing: number;
    product_thinking: number;
    [key: string]: number;
}
export interface SelfProfile {
    name: string;
    languages: string[];
    bio: string;
    writingStyle: WritingStyle;
    capabilities: Capabilities;
}
export interface Project {
    id: string;
    name: string;
    description: string;
    goals: string[];
    audience: string;
    status: string;
    focusThisWeek: string;
    createdAt: string;
}
export interface Insight {
    id: string;
    title: string;
    scenario: string;
    content: string;
    projectId: string | null;
    createdAt: string;
}
export interface MemoryData {
    selfProfile: SelfProfile;
    projects: Project[];
    insights: Insight[];
}
