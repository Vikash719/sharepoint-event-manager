export interface IEvent {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  imageUrl?: string;
  imageFile?: File;
}
