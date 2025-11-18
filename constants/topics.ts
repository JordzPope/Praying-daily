export type TopicId = 'family' | 'health' | 'work' | 'relationships';

export type TopicOption = {
  id: TopicId;
  label: string;
  icon: string;
};

export const TOPIC_ICON_COLOR = '#7A4A2B';

export const TOPICS: TopicOption[] = [
  { id: 'family', label: 'Family', icon: 'users' },
  { id: 'health', label: 'Health', icon: 'heart' },
  { id: 'work', label: 'Work', icon: 'laptop' },
  { id: 'relationships', label: 'Relationships', icon: 'hands-helping' },
];

export function getTopicById(id?: string): TopicOption {
  if (!id) return TOPICS[0];
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0];
}
