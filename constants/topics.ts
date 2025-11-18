export type TopicId = 'family' | 'health' | 'work' | 'relationships' | 'future-plans' | 'future-goals' | 'other-person' | 'other-situation';

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
  { id: 'future-plans', label: 'Future Plans', icon: 'arrow-circle-right' },
  { id: 'future-goals', label: 'Future Goals', icon: 'chart-line' },
  { id: 'other-person', label: 'Someone Else', icon: 'user' },
  { id: 'other-situation', label: 'Something Else', icon: 'praying-hands' },
];

export function getTopicById(id?: string): TopicOption {
  if (!id) return TOPICS[0];
  return TOPICS.find((topic) => topic.id === id) ?? TOPICS[0];
}
