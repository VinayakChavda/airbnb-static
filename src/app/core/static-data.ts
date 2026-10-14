// Static replacement for the backend content layer (ports backend/src/content.js + amenities.js).
import { DATA } from './listing-data';

export const TODAY = '2026-10-13'; // "current date" used by the demo calendar
export const SERVICE_FEE_RATE = 0.14;

const a = (key: string, name: string, unavailable = false) => ({ key, name, ...(unavailable && { unavailable }) });

const groups = [
  { title: 'Bathroom', items: [a('hair', 'Hairdryer'), a('cleanprod', 'Cleaning products'), a('shampoo', 'Shampoo'), a('hotwater', 'Hot water'), a('showergel', 'Shower gel')] },
  { title: 'Bedroom and laundry', items: [a('washer', 'Washing machine'), a('hangers', 'Hangers'), a('bedlinen', 'Bed linen'), a('blinds', 'Room-darkening blinds'), a('iron', 'Iron'), a('storage', 'Clothes storage'), a('cot', 'Cot')] },
  { title: 'Entertainment', items: [a('tv', 'TV')] },
  { title: 'Family', items: [a('cot', 'Cot')] },
  { title: 'Heating and cooling', items: [a('ac', 'Air conditioning'), a('fan', 'Ceiling fan')] },
  { title: 'Home safety', items: [a('camera', 'Exterior security cameras on property'), a('co', 'Carbon monoxide alarm', true), a('smoke', 'Smoke alarm', true)] },
  { title: 'Internet and office', items: [a('wifi', 'Wifi'), a('desk', 'Dedicated workspace')] },
  { title: 'Kitchen and dining', items: [a('kitchen', 'Kitchen'), a('fridge', 'Fridge'), a('fridge', 'Freezer'), a('microwave', 'Microwave'), a('kitchen', 'Cooking basics'), a('crockery', 'Crockery and cutlery'), a('kettle', 'Kettle'), a('coffee', 'Coffee'), a('wine', 'Wine glasses'), a('toaster', 'Toaster'), a('blender', 'Blender'), a('cooker', 'Cooker')] },
  { title: 'Location features', items: [a('door', 'Private entrance')] },
  { title: 'Outdoor', items: [a('patio', 'Patio or balcony'), a('dining', 'Outdoor dining area')] },
  { title: 'Parking and facilities', items: [a('parking', 'Free parking on premises'), a('pool', 'Pool'), a('tub', 'Hot tub'), a('gym', 'Gym')] },
  { title: 'Services', items: [a('pet', 'Pets allowed'), a('cleaning', 'Cleaning available during stay'), a('calendar', 'Long-term stays allowed'), a('door', 'Self check-in')] },
];

const highlights = [
  a('kitchen', 'Kitchen'), a('wifi', 'Wifi'), a('desk', 'Dedicated workspace'), a('parking', 'Free parking on premises'),
  a('pool', 'Pool'), a('tub', 'Hot tub'), a('pet', 'Pets allowed'), a('camera', 'Exterior security cameras on property'),
  a('co', 'Carbon monoxide alarm', true), a('smoke', 'Smoke alarm', true),
];

// Until real photos for the neighbouring listings exist, each card borrows one of the property photos.
const STAND_IN: Record<number, string> = {
  1: '67c61c6f-6260-4809-9510-0360e58a345d',
  2: 'fc02f48f-a937-42c5-895d-f9cc3113d6ca',
  3: 'a9831aeb-f441-44f5-a38f-4cf54e3f0fcf',
  4: '090d8b0b-b539-42c0-84f8-e1fb0cdf9a93',
  5: '2367476f-11c4-4a14-a7c6-267be62c1d59',
  6: '70325367-cbae-4993-b560-18cd3f6edd53',
  7: '23ea6621-6f74-4baa-acea-2fd03e312b41',
  8: '56c44812-52c0-4481-90d8-101ec1f34c7a',
};

export const LISTING: any = { ...DATA.listing, amenities: highlights, amenityGroups: groups, amenityTotal: 50, today: TODAY };
export const REVIEWS: any[] = DATA.reviews;
export const SIMILAR: any[] = DATA.similar.slice(0, 8).map((s: any) => ({ ...s, img: `/assets/images/photos/${STAND_IN[s.id]}.jpeg` }));
