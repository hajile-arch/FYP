export interface UserType {
  student_id: string;
  created_at: string;
  name: string;
  phone_number: string;
  email: string;
  password: string;
}

export interface FeedbackType{
  id:string;
  message:string;
}

export interface LoungeItemType {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface ItemType {
  item_id: string;
  created_at: string;
  updated_at: string;
  item_name: string;
  item_description: string;
  item_price: number;
  category_id: ItemCategoryType;
}

export interface ItemCategoryType {
  category_id: string;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_type: string;
}

export interface OrderType {
  order_id: string;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  location: string;
  status: string;
}

export interface OrderedItemType {
  order_id: string;
  item_id: string;
  created_at: string;
  unit: number;
  total_price: number;
}

export interface OrderTypeAndOrderedItemType {
  order_id: OrderedItemType;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  location: string;
  status: string;
}

export interface FormType {
  studentID: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface CandidateKeyType {
  id: string;
  student_id: string;
  email: string;
  phone_number: string;
}

export interface FoodTruckType {
  items: ({ error: true; } & "Received a generic string")[];
  category_id: string;
  category_name: string;
  category_type: string;
  category_img: string;
}

export interface StallType {
  category_id: string;
  category_name: string;
  category_img: string;
}

export interface ProfileType {
  student_id: string;
  created_at: string;
  name: string;
  phone_number: string;
  user_id: string;
  email: string;
}
