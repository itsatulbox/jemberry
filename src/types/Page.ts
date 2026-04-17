export interface Page {
  id: string;
  title: string;
  slug: string;
  nav_label: string;
  content: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}
